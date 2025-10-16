import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TicketsCount {
  [section: string]: number;
}

export const useTicketsCount = () => {
  const [ticketsCounts, setTicketsCounts] = useState<TicketsCount>({});
  const [totalNewTickets, setTotalNewTickets] = useState(0);

  const fetchTicketsCounts = async () => {
    try {
      // جلب tickets من آخر 24 ساعة
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('tickets')
        .select('section')
        .gte('created_at', oneDayAgo.toISOString());

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

    // الاستماع للـ tickets الجديدة
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
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
  }, []);

  return { ticketsCounts, totalNewTickets };
};
