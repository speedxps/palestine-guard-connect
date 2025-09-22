import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  AlertTriangle,
  FileText, 
  CheckSquare,
  Shield,
  Car,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'incident' | 'task' | 'violation' | 'cybercrime';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setIsLoading(true);
        
        // Get current user info
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile with role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const userRole = profile?.role;

        // Admins can see all activities
        const canSeeAll = userRole === 'admin';

        // Build queries based on role
        let incidentsQuery = supabase
          .from('incidents')
          .select('id, title, description, created_at, status, reporter_id, assigned_to')
          .order('created_at', { ascending: false })
          .limit(3);

        let tasksQuery = supabase
          .from('tasks')
          .select('id, title, description, created_at, status, assigned_to, assigned_by')
          .order('created_at', { ascending: false })
          .limit(3);

        let violationsQuery = supabase
          .from('traffic_records')
          .select('id, citizen_name, details, created_at, is_resolved')
          .order('created_at', { ascending: false })
          .limit(3);

        let cybercrimeQuery = supabase
          .from('cybercrime_reports')
          .select('id, description, created_at, status, reporter_id, assigned_to')
          .order('created_at', { ascending: false })
          .limit(3);

        // Get current user profile id for filtering
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        const profileId = currentProfile?.id;

        // Apply role-based filtering
        if (!canSeeAll && profileId) {
          // CID department - only incidents and cybercrime
          if (userRole === 'cid') {
            incidentsQuery = incidentsQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            cybercrimeQuery = cybercrimeQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            tasksQuery = tasksQuery.eq('assigned_to', profileId);
            // No traffic violations access
            violationsQuery = violationsQuery.limit(0);
          }
          // Traffic police - only violations and patrols
          else if (userRole === 'traffic_police') {
            violationsQuery = violationsQuery; // Can see all violations
            // Limited access to other activities
            incidentsQuery = incidentsQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            tasksQuery = tasksQuery.eq('assigned_to', profileId);
            cybercrimeQuery = cybercrimeQuery.limit(0);
          }
          // Special police - only tasks and assigned activities
          else if (userRole === 'special_police') {
            tasksQuery = tasksQuery.or(`assigned_to.eq.${profileId},assigned_by.eq.${profileId}`);
            incidentsQuery = incidentsQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            violationsQuery = violationsQuery.limit(0);
            cybercrimeQuery = cybercrimeQuery.limit(0);
          }
          // Cybercrime - only cybercrime related
          else if (userRole === 'cybercrime') {
            cybercrimeQuery = cybercrimeQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            incidentsQuery = incidentsQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            tasksQuery = tasksQuery.eq('assigned_to', profileId);
            violationsQuery = violationsQuery.limit(0);
          }
          // Officers and regular users - only their own activities
          else {
            incidentsQuery = incidentsQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            tasksQuery = tasksQuery.eq('assigned_to', profileId);
            cybercrimeQuery = cybercrimeQuery.or(`reporter_id.eq.${profileId},assigned_to.eq.${profileId}`);
            violationsQuery = violationsQuery.limit(0);
          }
        }

        // Execute queries
        const [
          { data: incidents },
          { data: tasks },
          { data: violations },
          { data: cybercrimeReports }
        ] = await Promise.all([
          incidentsQuery,
          tasksQuery,
          violationsQuery,
          cybercrimeQuery
        ]);

        // Combine and format all activities
        const allActivities: ActivityItem[] = [
          ...(incidents || []).map(item => ({
            id: item.id,
            type: 'incident' as const,
            title: item.title,
            description: item.description,
            timestamp: item.created_at,
            status: item.status
          })),
          ...(tasks || []).map(item => ({
            id: item.id,
            type: 'task' as const,
            title: item.title,
            description: item.description || '',
            timestamp: item.created_at,
            status: item.status
          })),
          ...(violations || []).map(item => ({
            id: item.id,
            type: 'violation' as const,
            title: `مخالفة - ${item.citizen_name}`,
            description: item.details || '',
            timestamp: item.created_at,
            status: item.is_resolved ? 'resolved' : 'open'
          })),
          ...(cybercrimeReports || []).map(item => ({
            id: item.id,
            type: 'cybercrime' as const,
            title: 'تقرير جريمة إلكترونية',
            description: item.description,
            timestamp: item.created_at,
            status: item.status
          }))
        ];

        // Sort by timestamp and take most recent 6
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 6);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return AlertTriangle;
      case 'task':
        return CheckSquare;
      case 'violation':
        return Car;
      case 'cybercrime':
        return Shield;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'incident':
        return 'text-red-500';
      case 'task':
        return 'text-purple-500';
      case 'violation':
        return 'text-blue-500';
      case 'cybercrime':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap = {
      'new': { label: 'جديد', variant: 'default' as const },
      'in_progress': { label: 'قيد المعالجة', variant: 'secondary' as const },
      'resolved': { label: 'محلول', variant: 'default' as const },
      'pending': { label: 'معلق', variant: 'secondary' as const },
      'completed': { label: 'مكتمل', variant: 'default' as const },
      'open': { label: 'مفتوح', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap];
    if (!statusInfo) return null;

    return (
      <Badge variant={statusInfo.variant} className="text-xs font-arabic">
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 font-arabic">النشاط الحديث</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg font-arabic">النشاط الحديث</h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 font-arabic">
            لا توجد أنشطة حديثة
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/activity/${activity.id}/${activity.type}`}
              >
                <div className={`p-2 rounded-lg bg-muted ${getActivityColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm font-arabic hover:text-primary">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground font-arabic line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true, 
                      locale: ar 
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;