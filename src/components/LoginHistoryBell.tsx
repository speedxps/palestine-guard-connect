import { useEffect, useState } from 'react';
import { MessageSquare, Shield, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

  const getStatusIcon = (description: string) => {
    if (description.includes('ناجح') || description.includes('success')) {
      return UserCheck;
    } else if (description.includes('محظور') || description.includes('blocked')) {
      return UserX;
    } else if (description.includes('فشل') || description.includes('failed')) {
      return AlertTriangle;
    }
    return Shield;
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
    return date.toLocaleDateString('ar-EG');
  };

  const getPriorityBadge = (description: string) => {
    if (description.includes('محظور') || description.includes('blocked')) {
      return { text: 'محظور', color: 'bg-emergency' };
    } else if (description.includes('فشل') || description.includes('failed')) {
      return { text: 'فشل', color: 'bg-warning' };
    } else if (description.includes('ناجح') || description.includes('success')) {
      return { text: 'ناجح', color: 'bg-success' };
    }
    return { text: 'تحذير', color: 'bg-muted' };
  };

  const handleLogClick = (log: LoginLog) => {
    setIsOpen(false);
    navigate('/login-history');
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
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
            سجل تسجيلات الدخول
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
          ) : loginLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد سجلات تسجيل دخول</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loginLogs.map((log) => {
                const StatusIcon = getStatusIcon(log.activity_description);
                const priorityBadge = getPriorityBadge(log.activity_description);
                return (
                  <div
                    key={log.id}
                    onClick={() => handleLogClick(log)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      new Date(log.created_at) > new Date(Date.now() - 60 * 60 * 1000)
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(log.activity_description)}`} />
                        <h4 className="font-bold text-foreground">{log.activity_description}</h4>
                      </div>
                      <Badge className={`${priorityBadge.color} text-primary-foreground text-xs`}>
                        {priorityBadge.text}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1 mb-2">
                      {log.payload?.email && (
                        <p className="text-foreground/80">
                          <span className="font-semibold">البريد:</span> {log.payload.email}
                        </p>
                      )}
                      
                      {log.metadata?.ip && (
                        <p className="text-foreground/80">
                          <span className="font-semibold">IP:</span> {log.metadata.ip}
                        </p>
                      )}
                      
                      {log.metadata?.location && (
                        <p className="text-foreground/80">
                          <span className="font-semibold">الموقع:</span> {log.metadata.location.city || 'غير معروف'}, {log.metadata.location.country || 'غير معروف'}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
