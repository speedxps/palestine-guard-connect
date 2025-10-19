import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  status: string;
  action_url?: string;
  news_id?: string;
}

export default function LoginHistoryBell() {
  const { user } = useAuth();
  const { roles } = useUserRoles();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user || roles.length === 0) return;

    try {
      console.log('Fetching notifications for roles:', roles);
      
      // Get notifications - if user has roles, include both system-wide and department-specific
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .or(`is_system_wide.eq.true,target_departments.ov.{${roles.join(',')}}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        throw notificationsError;
      }

      console.log('Fetched notifications:', notificationsData);

      // Get notification views for current user
      const { data: viewsData, error: viewsError } = await supabase
        .from('notification_views')
        .select('notification_id')
        .eq('user_id', user.id);

      if (viewsError) {
        console.error('Error fetching notification views:', viewsError);
        throw viewsError;
      }

      // Create a set of viewed notification IDs
      const viewedIds = new Set(viewsData?.map(v => v.notification_id) || []);

      // Mark notifications as read/unread based on views
      // تصفية الإشعارات - استبعاد إشعارات تسجيل الدخول (بما فيها المشبوهة) التي تظهر في زر الجرس
      const notificationsWithStatus = (notificationsData?.map(notification => ({
        ...notification,
        status: viewedIds.has(notification.id) ? 'read' : 'unread'
      })) || []).filter(notification => {
        const title = notification.title?.toLowerCase() || '';
        const message = notification.message?.toLowerCase() || '';
        
        // استبعاد جميع إشعارات تسجيل الدخول (العادية والمشبوهة)
        return !(
          title.includes('تسجيل دخول') ||
          title.includes('login') ||
          title.includes('محاولة دخول') ||
          title.includes('تنبيه عاجل') ||
          title.includes('مشبوه') ||
          message.includes('تسجيل دخول') ||
          message.includes('login') ||
          message.includes('محاولة دخول') ||
          message.includes('suspicious') ||
          message.includes('blocked') ||
          message.includes('محظور')
        );
      });

      console.log('Notifications with status:', notificationsWithStatus);
      console.log('Unread count:', notificationsWithStatus.filter(n => n.status === 'unread').length);

      setNotifications(notificationsWithStatus);
      setUnreadCount(notificationsWithStatus.filter(n => n.status === 'unread').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roles.length > 0) {
      fetchNotifications();
    }

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
          console.log('New notification received, refreshing...');
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
        return 'bg-emergency';
      case 'high':
        return 'bg-warning';
      case 'normal':
        return 'bg-primary';
      case 'low':
        return 'bg-muted-foreground';
      default:
        return 'bg-primary';
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
    return date.toLocaleDateString('en-US');
  };

  const markNotificationAsViewed = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Check if already viewed
      const { data: existingView } = await supabase
        .from('notification_views')
        .select('id')
        .eq('notification_id', notificationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingView) {
        const { error } = await supabase
          .from('notification_views')
          .insert({
            notification_id: notificationId,
            user_id: user.id
          });
        
        if (error) {
          console.error('Error marking notification as viewed:', error);
        } else {
          // Refresh notifications after successful insert
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    if (notification.status === 'unread') {
      await markNotificationAsViewed(notification.id);
    }
    
    // للإشعارات الخاصة بطلبات إغلاق التحقيق، وجّه للصفحة الإدارية
    if ((notification.title === 'طلب إغلاق تحقيق' || notification.title.includes('إغلاق')) && roles.includes('admin')) {
      console.log('Navigating to investigation closure management');
      setIsOpen(false);
      navigate('/investigation-closure-management');
      return;
    }
    
    // Navigate if action_url is provided
    if (notification.action_url) {
      console.log('Navigating to:', notification.action_url);
      setIsOpen(false);
      navigate(notification.action_url);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark all notifications as viewed when opening
      const unreadNotifications = notifications.filter(n => n.status === 'unread');
      
      // Reset unread count immediately for UI feedback
      setUnreadCount(0);
      
      // Mark notifications as viewed in database
      for (const notification of unreadNotifications) {
        await markNotificationAsViewed(notification.id);
      }
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-12 w-12"
        >
          <MessageSquare className={`h-8 w-8 ${unreadCount > 0 ? 'animate-pulse' : 'text-primary transition-colors'}`} />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-blue-500 text-white text-xs font-bold animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] sm:w-[400px]" style={{ direction: 'rtl' }}>
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            الإشعارات الأخرى
          </SheetTitle>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-muted rounded-lg animate-pulse">
                  <div className="h-4 bg-muted-foreground/30 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted-foreground/30 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
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
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-foreground flex-1">{notification.title}</h4>
                    <Badge className={`${getPriorityColor(notification.priority)} text-primary-foreground text-xs`}>
                      {getPriorityLabel(notification.priority)}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
}
