import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  status: string;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const { roles } = useUserRoles();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`is_system_wide.eq.true,target_departments.cs.{${roles.join(',')}}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => n.status === 'unread').length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roles]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'عاجل';
      case 'high':
        return 'مهم';
      case 'normal':
        return 'عادي';
      case 'low':
        return 'منخفض';
      default:
        return 'عادي';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  const markNotificationAsViewed = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('notification_views')
        .insert({
          notification_id: notificationId,
          user_id: user.id
        });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      markNotificationAsViewed(notification.id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Reset unread count immediately
      setUnreadCount(0);
      // Mark all notifications as viewed when opening
      notifications
        .filter(n => n.status === 'unread')
        .forEach(n => markNotificationAsViewed(n.id));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] sm:w-[400px]" style={{ direction: 'rtl' }}>
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-[#2B9BF4] flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات
          </SheetTitle>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    notification.status === 'unread'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 flex-1">{notification.title}</h4>
                    <Badge className={`${getPriorityColor(notification.priority)} text-white text-xs`}>
                      {getPriorityLabel(notification.priority)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
