import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Monitor, MapPin, Clock, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LoginEvent {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  geolocation: any;
  device_info: any;
  success: boolean;
  is_acknowledged: boolean;
  is_suspicious: boolean;
  route: string;
}

export default function LoginHistory() {
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<LoginEvent | null>(null);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const highlightEventId = searchParams.get('event');

  useEffect(() => {
    loadLoginEvents();
  }, []);

  const loadLoginEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('login_events')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLoginEvents(data || []);
    } catch (error) {
      console.error('Error loading login events:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل سجل تسجيل الدخول',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (eventId: string, isMe: boolean) => {
    try {
      const { error } = await supabase
        .from('login_events')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          is_suspicious: !isMe
        })
        .eq('id', eventId);

      if (error) throw error;

      if (!isMe) {
        // Trigger security actions
        setShowSecurityDialog(true);
      } else {
        toast({
          title: 'تم التأكيد',
          description: 'تم تأكيد محاولة تسجيل الدخول',
        });
      }

      loadLoginEvents();
    } catch (error) {
      console.error('Error acknowledging event:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة الحدث',
        variant: 'destructive'
      });
    }
  };

  const handleSecurityActions = async () => {
    try {
      // End all sessions except current
      await supabase.auth.signOut({ scope: 'others' });
      
      toast({
        title: 'إجراءات أمنية',
        description: 'تم إنهاء جميع الجلسات الأخرى. يُنصح بتغيير كلمة المرور.',
        variant: 'default'
      });

      setShowSecurityDialog(false);
    } catch (error) {
      console.error('Error executing security actions:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تنفيذ الإجراءات الأمنية',
        variant: 'destructive'
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">سجل تسجيل الدخول</h2>
          <p className="text-muted-foreground mt-1">
            تتبع محاولات تسجيل الدخول إلى حسابك
          </p>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {loginEvents.map((event) => (
            <Card
              key={event.id}
              className={`${
                highlightEventId === event.id ? 'ring-2 ring-primary' : ''
              } ${event.is_suspicious ? 'border-destructive' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {event.success ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <CardTitle className="text-base">
                      {event.success ? 'تسجيل دخول ناجح' : 'محاولة فاشلة'}
                    </CardTitle>
                  </div>
                  {event.is_suspicious && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      مشبوه
                    </Badge>
                  )}
                  {event.is_acknowledged && !event.is_suspicious && (
                    <Badge variant="secondary">تم التأكيد</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.geolocation?.city || 'غير معروف'},{' '}
                      {event.geolocation?.country || 'غير معروف'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.device_info?.browser || 'غير معروف'} على{' '}
                      {event.device_info?.os || 'غير معروف'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">IP:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {event.ip_address || 'غير متوفر'}
                    </code>
                  </div>
                </div>

                {/* GPS Location Button */}
                {event.geolocation?.gps_latitude && event.geolocation?.gps_longitude && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const lat = event.geolocation.gps_latitude;
                        const lng = event.geolocation.gps_longitude;
                        setSelectedLocation({ lat, lng });
                        setMapDialogOpen(true);
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      عرض الموقع على الخريطة
                      {event.geolocation.gps_accuracy && (
                        <span className="text-xs text-muted-foreground mr-2">
                          (دقة: {Math.round(event.geolocation.gps_accuracy)}م)
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {!event.is_acknowledged && event.success && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(event.id, true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      هذا أنا
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedEvent(event);
                        handleAcknowledge(event.id, false);
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      لم أقم بهذا
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {loginEvents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Monitor className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">لا توجد سجلات</p>
                <p className="text-sm text-muted-foreground mt-1">
                  لم يتم تسجيل أي محاولات دخول بعد
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تنبيه أمني
            </AlertDialogTitle>
            <AlertDialogDescription>
              تم تحديد محاولة دخول مشبوهة. سيتم تنفيذ الإجراءات الأمنية التالية:
              <ul className="list-disc list-inside mt-3 space-y-1">
                <li>إنهاء جميع الجلسات النشطة الأخرى</li>
                <li>إرسال تنبيه للإدارة</li>
                <li>يُنصح بشدة بتغيير كلمة المرور فوراً</li>
                <li>تفعيل المصادقة الثنائية إن لم تكن مفعلة</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleSecurityActions} className="bg-destructive">
              تنفيذ الإجراءات الأمنية
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle>موقع تسجيل الدخول</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=15&output=embed`}
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}