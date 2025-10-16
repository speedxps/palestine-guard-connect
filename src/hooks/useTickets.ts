import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LogTicketParams {
  section: string;
  action_type: 'create' | 'update' | 'delete' | 'view';
  description: string;
  metadata?: any;
}

export const useTickets = () => {
  const logTicket = async ({ section, action_type, description, metadata }: LogTicketParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user profile to get the full name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('user_id', user.id)
        .single();

      const userName = profile?.full_name || profile?.username || user.email || 'مستخدم';

      const { error } = await supabase
        .from('tickets')
        .insert({
          section,
          action_type,
          description,
          user_id: user.id,
          user_name: userName,
          metadata
        });

      if (error) throw error;

      // إظهار toast بعد تسجيل ticket بنجاح
      toast({
        title: '✅ تم التسجيل',
        description: 'تم تسجيل عملية tickets 1 جديدة',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error logging ticket:', error);
    }
  };

  return { logTicket };
};
