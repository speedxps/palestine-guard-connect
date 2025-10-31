import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Car, User, FileText, Megaphone, History, MapPin, Calendar, Loader2, Copy, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';
import { UnifiedNotificationSystem } from '@/components/notifications/UnifiedNotificationSystem';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const VehicleRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [currentOwner, setCurrentOwner] = useState<any>(null);
  const [previousOwners, setPreviousOwners] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  const { notificationHistory, loading: historyLoading } = useNotifications({ 
    contextType: 'vehicle', 
    contextId: id! 
  });

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);

      // Fetch vehicle data
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicle_registrations')
        .select('*')
        .eq('id', id)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      // Fetch owners
      const { data: ownersData, error: ownersError } = await supabase
        .from('vehicle_owners')
        .select('*')
        .eq('vehicle_id', id)
        .order('ownership_start_date', { ascending: false });

      if (ownersError) throw ownersError;
      
      const current = ownersData?.find(o => o.is_current_owner);
      const previous = ownersData?.filter(o => !o.is_current_owner) || [];
      
      setCurrentOwner(current);
      setPreviousOwners(previous);

      // Fetch violations
      const { data: violationsData, error: violationsError } = await supabase
        .from('vehicle_violations')
        .select('*')
        .eq('vehicle_id', id)
        .order('violation_date', { ascending: false });

      if (violationsError) throw violationsError;
      setViolations(violationsData || []);

    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      toast.error('فشل في تحميل بيانات المركبة');
    } finally {
      setLoading(false);
    }
  };

  const resendNotification = (notification: any) => {
    // Implementation will reuse the notification dialog
    toast.info('جاري إعادة فتح نافذة الإرسال...');
    setActiveDialog('notification');
  };

  const openWhatsApp = (text: string) => {
    if (!currentOwner?.phone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${currentOwner.phone}?text=${encoded}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">المركبة غير موجودة</p>
          <Button onClick={() => navigate('/universal-search')} className="mt-4">
            العودة للبحث
          </Button>
        </div>
      </div>
    );
  }

  const pendingViolations = violations.filter(v => v.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">سجل مركبة</h1>
            <p className="text-muted-foreground">رقم اللوحة: {vehicle.plate_number}</p>
          </div>
        </div>

        {/* Main Info Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              معلومات المركبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">رقم اللوحة</p>
                <p className="font-semibold text-lg">{vehicle.plate_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نوع المركبة</p>
                <p className="font-semibold">{vehicle.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الطراز</p>
                <p className="font-semibold">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">سنة الصنع</p>
                <p className="font-semibold">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">اللون</p>
                <p className="font-semibold">{vehicle.color}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                  {vehicle.status === 'active' ? 'نشط' : vehicle.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        {currentOwner && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                المالك الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-semibold">{currentOwner.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهوية</p>
                  <p className="font-semibold">{currentOwner.national_id}</p>
                </div>
                {currentOwner.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-semibold">{currentOwner.phone}</p>
                  </div>
                )}
                {currentOwner.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">العنوان</p>
                    <p className="font-semibold">{currentOwner.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg border-t-4 border-red-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-600">{violations.length}</p>
                <p className="text-sm text-muted-foreground mt-1">إجمالي المخالفات</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-yellow-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-600">{pendingViolations.length}</p>
                <p className="text-sm text-muted-foreground mt-1">مخالفات معلقة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-blue-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{previousOwners.length}</p>
                <p className="text-sm text-muted-foreground mt-1">ملاك سابقون</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setActiveDialog('notification')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Megaphone className="h-12 w-12 mb-3 text-primary" />
              <p className="font-semibold">إرسال تبليغ</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setActiveDialog('history')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <History className="h-12 w-12 mb-3 text-indigo-500" />
              <p className="font-semibold">سجل التبليغات</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FileText className="h-12 w-12 mb-3 text-green-500" />
              <p className="font-semibold">طباعة السجل</p>
            </CardContent>
          </Card>
        </div>

        {/* Violations List */}
        {violations.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                سجل المخالفات ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {violations.map((violation) => (
                  <div key={violation.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{violation.violation_type}</p>
                        <p className="text-sm text-muted-foreground">{violation.location}</p>
                      </div>
                      <Badge variant={violation.status === 'pending' ? 'destructive' : 'default'}>
                        {violation.status === 'pending' ? 'معلق' : violation.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{new Date(violation.violation_date).toLocaleDateString('ar-PS')}</span>
                      <span className="font-semibold">{violation.fine_amount} ₪</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification System Dialog */}
      {currentOwner && (
        <UnifiedNotificationSystem
          open={activeDialog === 'notification'}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          recipientType="vehicle_owner"
          recipientId={currentOwner.id}
          recipientName={currentOwner.owner_name}
          recipientNationalId={currentOwner.national_id}
          recipientPhone={currentOwner.phone}
          contextType="vehicle"
          contextId={id!}
        />
      )}

      {/* Notification History Dialog */}
      <Dialog open={activeDialog === 'history'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سجل التبليغات المرسلة</DialogTitle>
          </DialogHeader>
          
          {historyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : notificationHistory.length > 0 ? (
            <div className="space-y-4">
              {notificationHistory.map((notification) => (
                <Card key={notification.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <Badge>{notification.template_used}</Badge>
                      <p className="text-sm text-muted-foreground">
                        المرسل: {notification.sender?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.created_at && format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(notification.notification_text);
                          toast.success('تم نسخ النص');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resendNotification(notification)}
                      >
                        إعادة إرسال
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWhatsApp(notification.notification_text)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">
                    {notification.notification_text}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              لا توجد تبليغات مرسلة سابقاً
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleRecord;
