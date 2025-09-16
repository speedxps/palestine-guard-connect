import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalViolations: number;
  openViolations: number;
  totalIncidents: number;
  openIncidents: number;
  totalTasks: number;
  pendingTasks: number;
  totalReports: number;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalViolations: 0,
    openViolations: 0,
    totalIncidents: 0,
    openIncidents: 0,
    totalTasks: 0,
    pendingTasks: 0,
    totalReports: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch violations stats
        const { count: violationsCount } = await supabase
          .from('traffic_records')
          .select('*', { count: 'exact', head: true });
        
        const { count: openViolationsCount } = await supabase
          .from('traffic_records')
          .select('*', { count: 'exact', head: true })
          .eq('is_resolved', false);

        // Fetch incidents stats
        const { count: incidentsCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true });
        
        const { count: openIncidentsCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'resolved');

        // Fetch tasks stats
        const { count: tasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });
        
        const { count: pendingTasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch reports stats
        const { count: reportsCount } = await supabase
          .from('cybercrime_reports')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: usersCount || 0,
          totalViolations: violationsCount || 0,
          openViolations: openViolationsCount || 0,
          totalIncidents: incidentsCount || 0,
          openIncidents: openIncidentsCount || 0,
          totalTasks: tasksCount || 0,
          pendingTasks: pendingTasksCount || 0,
          totalReports: reportsCount || 0,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'حدث خطأ في تحميل الإحصائيات'
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};