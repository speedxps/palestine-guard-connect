import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EmergencyPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

const EmergencyNotificationSystem = () => {
  const [emergencyPosts, setEmergencyPosts] = useState<EmergencyPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<EmergencyPost | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // جلب المنشورات الطارئة الحالية
    fetchEmergencyPosts();

    // الاستماع للمنشورات الطارئة الجديدة
    const channel = supabase
      .channel('emergency_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'privacy_level=eq.emergency'
        },
        (payload) => {
          const newPost = payload.new as EmergencyPost;
          setEmergencyPosts(prev => [newPost, ...prev]);
          setShowNotification(true);
          
          // إشعار صوتي
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('إشعار طارئ!', {
              body: newPost.content,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchEmergencyPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(full_name)
        `)
        .eq('privacy_level', 'emergency')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setEmergencyPosts(data || []);
      
      // إظهار الإشعار إذا كان هناك منشورات طارئة جديدة (خلال آخر 10 دقائق)
      const recentPosts = data?.filter(post => {
        const postTime = new Date(post.created_at);
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        return postTime > tenMinutesAgo;
      }) || [];
      
      if (recentPosts.length > 0) {
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error fetching emergency posts:', error);
    }
  };

  const openPostDetails = (post: EmergencyPost) => {
    setSelectedPost(post);
    setShowNotification(false);
  };

  if (!showNotification && emergencyPosts.length === 0) {
    return null;
  }

  return (
    <>
      {/* الإشعار المضيء */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-pulse">
          <Alert className="bg-red-600 text-white border-red-700 shadow-lg shadow-red-500/50 min-w-80">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>إشعار طارئ!</strong>
                <br />
                يوجد {emergencyPosts.length} إشعار طارئ جديد
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openPostDetails(emergencyPosts[0])}
                >
                  عرض
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNotification(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* قائمة الإشعارات الطارئة في الشريط الجانبي */}
      {emergencyPosts.length > 0 && !showNotification && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={() => setShowNotification(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg animate-bounce"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {emergencyPosts.length} طارئ
          </Button>
        </div>
      )}

      {/* نافذة تفاصيل المنشور الطارئ */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              إشعار طارئ
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  من: {selectedPost.profiles?.full_name || 'غير معروف'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  التاريخ: {new Date(selectedPost.created_at).toLocaleString('en-US')}
                </p>
                <div className="font-medium text-gray-900">
                  {selectedPost.content}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSelectedPost(null)}
                  className="flex-1"
                >
                  فهمت
                </Button>
                {emergencyPosts.length > 1 && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const currentIndex = emergencyPosts.findIndex(p => p.id === selectedPost.id);
                      const nextIndex = (currentIndex + 1) % emergencyPosts.length;
                      setSelectedPost(emergencyPosts[nextIndex]);
                    }}
                  >
                    التالي
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyNotificationSystem;