import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SuspiciousLogin {
  id: string;
  user_id: string | null;
  email: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  user_agent: string | null;
  attempt_time: string;
  blocked: boolean;
  severity: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export const useSuspiciousLogins = () => {
  const { user } = useAuth();
  const [suspiciousLogins, setSuspiciousLogins] = useState<SuspiciousLogin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuspiciousLogins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suspicious_login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSuspiciousLogins((data || []) as SuspiciousLogin[]);
    } catch (error) {
      console.error('Error fetching suspicious logins:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLoginStatus = async (loginId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('suspicious_login_attempts')
        .update({ status, notes })
        .eq('id', loginId);

      if (error) throw error;
      await fetchSuspiciousLogins();
    } catch (error) {
      console.error('Error updating login status:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuspiciousLogins();
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('suspicious_logins_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'suspicious_login_attempts',
        },
        () => {
          fetchSuspiciousLogins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    suspiciousLogins,
    loading,
    fetchSuspiciousLogins,
    updateLoginStatus,
  };
};
