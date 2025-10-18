import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  MapPin,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  FileText,
  Calendar
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  location_address: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string | null;
  assigned_by: string;
  department: string | null;
  created_at: string;
  updated_at: string;
  location_lat?: number;
  location_lng?: number;
  assigner_profile?: {
    full_name: string;
    badge_number: string;
  };
}

const DepartmentTasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    loadUserRoles();
  }, [user]);

  useEffect(() => {
    if (userRoles.length > 0) {
      loadTasks();
    }
  }, [userRoles]);

  const loadUserRoles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserRoles(data?.map(r => r.role) || []);
    } catch (error: any) {
      console.error('Error loading user roles:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      // تحميل المهام التي تخص أقسام المستخدم
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigner_profile:profiles!tasks_assigned_by_fkey(full_name, badge_number)
        `)
        .in('department', userRoles as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المهام',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة المهمة'
      });

      loadTasks();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث المهمة',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDepartmentName = (dept: string) => {
    switch (dept) {
      case 'traffic_police': return 'شرطة المرور';
      case 'cid': return 'المباحث الجنائية';
      case 'special_police': return 'الشرطة الخاصة';
      case 'cybercrime': return 'مكافحة الجرائم الإلكترونية';
      case 'judicial_police': return 'الشرطة القضائية';
      default: return dept;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // إحصائيات المهام
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <Shield className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">المهام المطلوبة</h1>
          </div>
          <div />
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المهام</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-blue-400">{pendingCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-yellow-400">{inProgressCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مكتملة</p>
                  <p className="text-2xl font-bold text-green-400">{completedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            
            return (
              <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                      {task.department && (
                        <Badge variant="outline" className="mb-2">
                          {getDepartmentName(task.department)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description || 'لا يوجد وصف'}
                  </p>

                  <div className="space-y-2 text-sm">
                    {task.location_address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{task.location_address}</span>
                      </div>
                    )}
                    
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(task.due_date).toLocaleString('ar')}</span>
                      </div>
                    )}

                    {task.assigner_profile && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>تم التكليف بواسطة: {task.assigner_profile.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${
                        task.status === 'completed' ? 'text-green-400' :
                        task.status === 'in_progress' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <Badge className={getStatusColor(task.status)}>
                        {task.status === 'pending' ? 'قيد الانتظار' :
                         task.status === 'in_progress' ? 'قيد التنفيذ' :
                         task.status === 'completed' ? 'مكتملة' : task.status}
                      </Badge>
                    </div>

                    {task.status !== 'completed' && (
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value as 'pending' | 'in_progress' | 'completed')}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                          <SelectItem value="completed">مكتملة</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">
                {loading ? 'جاري التحميل...' : 'لا توجد مهام مطلوبة من قسمك'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DepartmentTasks;
