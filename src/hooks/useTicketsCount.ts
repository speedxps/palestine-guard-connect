import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

interface TicketsCount {
  [section: string]: number;
}

export const useTicketsCount = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [ticketsCounts, setTicketsCounts] = useState<TicketsCount>({});
  const [totalNewTickets, setTotalNewTickets] = useState(0);

  const fetchTicketsCounts = async () => {
    try {
      if (!user) {
        setTicketsCounts({});
        setTotalNewTickets(0);
        return;
      }

      // جلب tickets من آخر 24 ساعة
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      let query = supabase
        .from('tickets')
        .select('section, user_id')
        .gte('created_at', oneDayAgo.toISOString());

      // إذا لم يكن admin، فقط جلب tickets الخاصة بالمستخدم
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // حساب عدد tickets لكل قسم
      const counts: TicketsCount = {};
      let total = 0;

      data?.forEach((ticket) => {
        counts[ticket.section] = (counts[ticket.section] || 0) + 1;
        total++;
      });

      setTicketsCounts(counts);
      setTotalNewTickets(total);
    } catch (error) {
      console.error('Error fetching tickets counts:', error);
    }
  };

  useEffect(() => {
    fetchTicketsCounts();

    // الاستماع للـ tickets الجديدة والمحذوفة
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => {
          fetchTicketsCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  return { ticketsCounts, totalNewTickets };
};
