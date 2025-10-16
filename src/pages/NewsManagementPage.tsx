import React, { useEffect } from 'react';
import { NewsManagement } from '@/components/NewsManagement';
import { BackButton } from '@/components/BackButton';
import { Newspaper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const NewsManagementPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-send notification when news is published
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('news_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'internal_news'
        },
        async (payload) => {
          console.log('News insert detected:', payload.new);
          
          if (payload.new.is_published) {
            try {
              // Get the author's profile
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', payload.new.author_id)
                .single();

              if (profileError) {
                console.error('Error fetching profile:', profileError);
                return;
              }

              if (profileData) {
                const { data: notificationData, error: notificationError } = await supabase
                  .from('notifications')
                  .insert({
                    sender_id: profileData.id,
                    title: 'خبر جديد',
                    message: `تم نشر خبر جديد: ${payload.new.title}`,
                    priority: 'normal',
                    is_system_wide: true
                  })
                  .select()
                  .single();

                if (notificationError) {
                  console.error('Error creating notification:', notificationError);
                } else {
                  console.log('Notification created successfully:', notificationData);
                  toast({
                    title: "تم إرسال الإشعار",
                    description: "تم إرسال إشعار لجميع المستخدمين بالخبر الجديد",
                  });
                }
              }
            } catch (error) {
              console.error('Error sending notification:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <Newspaper className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">إدارة الأخبار</h1>
          </div>
          <div />
        </div>

        <NewsManagement />
      </div>
    </div>
  );
};

export default NewsManagementPage;
