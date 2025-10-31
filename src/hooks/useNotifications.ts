import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationRecord {
  id: string;
  citizen_id: string | null;
  sender_id: string;
  notification_text: string;
  template_used: string;
  sent_via: string;
  scheduled_date: string | null;
  scheduled_day: string | null;
  scheduled_time: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  sender?: {
    full_name: string;
  } | null;
}

interface UseNotificationsProps {
  contextType: 'citizen' | 'vehicle' | 'incident' | 'patrol' | 'cybercrime' | 'judicial';
  contextId: string;
}

export const useNotifications = ({ contextType, contextId }: UseNotificationsProps) => {
  const [notificationHistory, setNotificationHistory] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('official_notifications')
        .select('*')
        .eq('citizen_id', contextId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificationHistory((data || []) as unknown as NotificationRecord[]);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      toast.error('فشل في تحميل سجل التبليغات');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (
    recipientId: string,
    notificationText: string,
    template: string,
    customDate?: Date,
    customDay?: string,
    customTime?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('official_notifications')
        .insert([{
          citizen_id: recipientId,
          sender_id: user.id,
          notification_text: notificationText,
          template_used: template,
          scheduled_date: customDate?.toISOString().split('T')[0] || null,
          scheduled_day: customDay || null,
          scheduled_time: customTime || null,
          status: 'sent',
          sent_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast.success('تم حفظ التبليغ بنجاح');
      await fetchNotificationHistory();
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('فشل في حفظ التبليغ');
      return false;
    }
  };

  const resendNotification = async (notification: NotificationRecord) => {
    return await sendNotification(
      notification.citizen_id || '',
      notification.notification_text,
      notification.template_used,
      notification.scheduled_date ? new Date(notification.scheduled_date) : undefined,
      notification.scheduled_day || undefined,
      notification.scheduled_time || undefined
    );
  };

  useEffect(() => {
    if (contextId) {
      fetchNotificationHistory();
    }
  }, [contextId]);

  return {
    notificationHistory,
    loading,
    fetchNotificationHistory,
    sendNotification,
    resendNotification,
  };
};
