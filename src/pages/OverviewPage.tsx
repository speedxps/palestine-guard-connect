import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  LogIn,
  Key
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ActivityLog {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
  metadata?: any;
}

interface Stats {
  totalUsers: number;
  userChange: number;
  openViolations: number;
  violationChange: number;
  openIncidents: number;
  incidentChange: number;
  pendingTasks: number;
  taskChange: number;
}

export default function OverviewPage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    userChange: 0,
    openViolations: 0,
    violationChange: 0,
    openIncidents: 0,
    incidentChange: 0,
    pendingTasks: 0,
    taskChange: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    fetchStatistics();
    
    // Real-time updates
    const activityChannel = supabase
      .channel('activity-logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchActivities)
      .subscribe();
    
    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('created_at', lastMonth.toISOString());

      // Open violations
      const { count: openViolations } = await supabase
        .from('vehicle_violations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: lastMonthViolations } = await supabase
        .from('vehicle_violations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lte('created_at', lastMonth.toISOString());

      // Open incidents
      const { count: openIncidents } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'in_progress']);

      const { count: lastMonthIncidents } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'in_progress'])
        .lte('created_at', lastMonth.toISOString());

      // Pending tasks
      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: lastMonthTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lte('created_at', lastMonth.toISOString());

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      setStats({
        totalUsers: totalUsers || 0,
        userChange: calculateChange(totalUsers || 0, lastMonthUsers || 0),
        openViolations: openViolations || 0,
        violationChange: calculateChange(openViolations || 0, lastMonthViolations || 0),
        openIncidents: openIncidents || 0,
        incidentChange: calculateChange(openIncidents || 0, lastMonthIncidents || 0),
        pendingTasks: pendingTasks || 0,
        taskChange: calculateChange(pendingTasks || 0, lastMonthTasks || 0)
      });

    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "خطأ في تحميل الإحصائيات",
        description: "فشل في تحميل البيانات الإحصائية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="w-4 h-4" />;
      case 'incident_created': return <AlertTriangle className="w-4 h-4" />;
      case 'password_reset_request': return <Key className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / 60000);

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold">نظرة عامة - Overview</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}+</div>
              <div className="flex items-center gap-1 text-xs">
                {stats.userChange >= 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">+{stats.userChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-500">{stats.userChange}%</span>
                  </>
                )}
                <span className="text-muted-foreground mr-1">مقارنة بالشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المخالفات المفتوحة</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openViolations}+</div>
              <Badge variant="destructive" className="mt-2">يتطلب متابعة</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">البلاغات المفتوحة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openIncidents}+</div>
              <Badge variant="secondary" className="mt-2">قيد التحقيق</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام المعلقة</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}+</div>
              <Badge variant="outline" className="mt-2">تحتاج اهتمام</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا يوجد نشاط حديث</div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.activity_description}</p>
                      <p className="text-sm text-muted-foreground">
                        {getRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {activity.activity_type === 'login' ? 'تسجيل دخول' : 
                       activity.activity_type === 'incident_created' ? 'بلاغ جديد' :
                       activity.activity_type === 'password_reset_request' ? 'إعادة تعيين كلمة مرور' :
                       'نشاط'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
