import { useEffect, useState } from 'react';
import { Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface LoginLog {
  id: string;
  activity_type: string;
  activity_description: string;
  user_id: string | null;
  payload: any;
  created_at: string;
  metadata: any;
}

export default function LoginHistoryBell() {
  const { user } = useAuth();
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchLoginLogs();

    // الاشتراك في التحديثات الفورية
    const channel = supabase
      .channel('activity_logs_login_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: 'activity_type=eq.login'
        },
        (payload) => {
          console.log('New login activity:', payload);
          fetchLoginLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchLoginLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('activity_type', 'login')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setLoginLogs(data || []);
      
      // حساب عدد الإشعارات غير المقروءة (آخر ساعة)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const unread = (data || []).filter(log => 
        new Date(log.created_at) > oneHourAgo
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching login logs:', error);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUnreadCount(0); // إعادة تعيين العداد عند الفتح
    }
  };

  const getStatusColor = (description: string) => {
    if (description.includes('ناجح') || description.includes('success')) {
      return 'text-green-600';
    } else if (description.includes('محظور') || description.includes('blocked')) {
      return 'text-red-600';
    } else if (description.includes('فشل') || description.includes('failed')) {
      return 'text-orange-600';
    }
    return 'text-gray-600';
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl flex items-center gap-2">
            <Bell className="h-5 w-5" />
            سجل تسجيلات الدخول
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {loginLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد سجلات تسجيل دخول</p>
            </div>
          ) : (
            loginLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className={`font-semibold ${getStatusColor(log.activity_description)}`}>
                        {log.activity_description}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      {log.payload?.email && (
                        <div className="text-muted-foreground">
                          البريد: {log.payload.email}
                        </div>
                      )}
                      
                      {log.metadata?.ip && (
                        <div className="text-muted-foreground">
                          IP: {log.metadata.ip}
                        </div>
                      )}
                      
                      {log.metadata?.location && (
                        <div className="text-muted-foreground">
                          الموقع: {log.metadata.location.city || 'غير معروف'}, {log.metadata.location.country || 'غير معروف'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-left">
                    {format(new Date(log.created_at), 'PPp', { locale: ar })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
