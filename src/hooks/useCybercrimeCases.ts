import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CybercrimeCase {
  id: string;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  priority: string;
  status: string;
  reporter_id: string;
  assigned_officer_id: string | null;
  evidence_files: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStats {
  activeCases: number;
  solvedCases: number;
  resolutionRate: number;
  investigators: number;
  weeklyIncrease: number;
  monthlyIncrease: number;
}

export const useCybercrimeCases = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<CybercrimeCase[]>([]);
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cybercrime_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل القضايا',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get active cases
      const { count: activeCount } = await supabase
        .from('cybercrime_cases')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'investigating']);

      // Get solved cases
      const { count: solvedCount } = await supabase
        .from('cybercrime_cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      // Get total cases
      const { count: totalCount } = await supabase
        .from('cybercrime_cases')
        .select('*', { count: 'exact', head: true });

      // Get investigators count (users with cybercrime role)
      const { count: investigatorsCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'cybercrime');

      // Calculate weekly increase
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weeklyCount } = await supabase
        .from('cybercrime_cases')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Calculate monthly increase
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: monthlyCount } = await supabase
        .from('cybercrime_cases')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      const resolutionRate = totalCount ? Math.round(((solvedCount || 0) / totalCount) * 100) : 0;

      setStats({
        activeCases: activeCount || 0,
        solvedCases: solvedCount || 0,
        resolutionRate,
        investigators: investigatorsCount || 0,
        weeklyIncrease: weeklyCount || 0,
        monthlyIncrease: monthlyCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createCase = async (caseData: {
    title: string;
    description: string;
    case_type: string;
    priority: string;
  }) => {
    try {
      // Get reporter profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Generate case number
      const caseNumber = `CYB${Date.now().toString().slice(-6)}`;

      const { data, error } = await supabase
        .from('cybercrime_cases')
        .insert({
          case_number: caseNumber,
          title: caseData.title,
          description: caseData.description,
          case_type: caseData.case_type,
          priority: caseData.priority,
          status: 'open',
          reporter_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم إنشاء القضية بنجاح',
      });

      await fetchCases();
      await fetchStats();
      return data;
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء القضية',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCaseStatus = async (caseId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('cybercrime_cases')
        .update({ status })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم تحديث حالة القضية',
      });

      await fetchCases();
      await fetchStats();
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث القضية',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCases();
      fetchStats();
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('cybercrime_cases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cybercrime_cases',
        },
        () => {
          fetchCases();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    cases,
    stats,
    loading,
    fetchCases,
    createCase,
    updateCaseStatus,
  };
};
