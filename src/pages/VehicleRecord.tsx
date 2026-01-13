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
import { CitizenQuickView } from '@/components/CitizenQuickView';

const VehicleRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [currentOwner, setCurrentOwner] = useState<any>(null);
  const [previousOwners, setPreviousOwners] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [detailsDialog, setDetailsDialog] = useState<'violations' | 'pending' | 'owners' | null>(null);
  
  const { notificationHistory, loading: historyLoading, fetchNotificationHistory } = useNotifications({ 
    contextType: 'vehicle', 
    contextId: id! 
  });
  
  // جلب سجل التبليغات بناءً على national_id للمالك الحالي
  useEffect(() => {
    if (currentOwner?.national_id) {
      fetchNotificationHistory(currentOwner.national_id);
    }
  }, [currentOwner?.national_id]);

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
              
              {/* زر الملف الشامل للمالك */}
              {currentOwner.national_id && (
                <div className="mt-4 flex justify-center">
                  <CitizenQuickView 
                    nationalId={currentOwner.national_id}
                    triggerText="📋 عرض الملف الشامل للمالك"
                  >
                    <Button variant="default" size="lg">
                      <User className="w-4 h-4 ml-2" />
                      عرض الملف الشامل للمالك
                    </Button>
                  </CitizenQuickView>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="shadow-lg border-t-4 border-red-500 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setDetailsDialog('violations')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-600">{violations.length}</p>
                <p className="text-sm text-muted-foreground mt-1">إجمالي المخالفات</p>
                <p className="text-xs text-muted-foreground mt-2">انقر لعرض التفاصيل</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="shadow-lg border-t-4 border-yellow-500 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setDetailsDialog('pending')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-600">{pendingViolations.length}</p>
                <p className="text-sm text-muted-foreground mt-1">مخالفات معلقة</p>
                <p className="text-xs text-muted-foreground mt-2">انقر لعرض التفاصيل</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="shadow-lg border-t-4 border-blue-500 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setDetailsDialog('owners')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{previousOwners.length}</p>
                <p className="text-sm text-muted-foreground mt-1">ملاك سابقون</p>
                <p className="text-xs text-muted-foreground mt-2">انقر لعرض التفاصيل</p>
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

      {/* Details Dialogs */}
      {/* All Violations Dialog */}
      <Dialog open={detailsDialog === 'violations'} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إجمالي المخالفات ({violations.length})</DialogTitle>
          </DialogHeader>
          
          {violations.length > 0 ? (
            <div className="space-y-3">
              {violations.map((violation) => (
                <Card key={violation.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-lg">{violation.violation_type}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <MapPin className="inline h-3 w-3 ml-1" />
                        {violation.location}
                      </p>
                      {violation.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{violation.notes}</p>
                      )}
                    </div>
                    <Badge variant={violation.status === 'pending' ? 'destructive' : violation.status === 'paid' ? 'default' : 'secondary'}>
                      {violation.status === 'pending' ? 'معلق' : violation.status === 'paid' ? 'مدفوع' : violation.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(violation.violation_date).toLocaleDateString('ar-PS')}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-lg">{violation.fine_amount} ₪</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">لا توجد مخالفات</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Pending Violations Dialog */}
      <Dialog open={detailsDialog === 'pending'} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>المخالفات المعلقة ({pendingViolations.length})</DialogTitle>
          </DialogHeader>
          
          {pendingViolations.length > 0 ? (
            <div className="space-y-3">
              {pendingViolations.map((violation) => (
                <Card key={violation.id} className="p-4 border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-lg">{violation.violation_type}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <MapPin className="inline h-3 w-3 ml-1" />
                        {violation.location}
                      </p>
                      {violation.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{violation.notes}</p>
                      )}
                    </div>
                    <Badge variant="destructive">معلق</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(violation.violation_date).toLocaleDateString('ar-PS')}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-lg text-red-600">{violation.fine_amount} ₪</span>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  إجمالي المبلغ المستحق: {pendingViolations.reduce((sum, v) => sum + (v.fine_amount || 0), 0)} ₪
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">لا توجد مخالفات معلقة</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Previous Owners Dialog */}
      <Dialog open={detailsDialog === 'owners'} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>الملاك السابقون ({previousOwners.length})</DialogTitle>
          </DialogHeader>
          
          {previousOwners.length > 0 ? (
            <div className="space-y-3">
              {previousOwners.map((owner, index) => (
                <Card key={owner.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">مالك سابق #{previousOwners.length - index}</Badge>
                      </div>
                      <p className="font-semibold text-lg">{owner.owner_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        رقم الهوية: {owner.national_id}
                      </p>
                      {owner.phone && (
                        <p className="text-sm text-muted-foreground">
                          <Phone className="inline h-3 w-3 ml-1" />
                          {owner.phone}
                        </p>
                      )}
                      {owner.address && (
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="inline h-3 w-3 ml-1" />
                          {owner.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm bg-muted/50 p-3 rounded">
                    <div>
                      <p className="text-muted-foreground">تاريخ الملكية</p>
                      <p className="font-semibold">
                        {owner.ownership_start_date && new Date(owner.ownership_start_date).toLocaleDateString('ar-PS')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">تاريخ نهاية الملكية</p>
                      <p className="font-semibold">
                        {owner.ownership_end_date ? new Date(owner.ownership_end_date).toLocaleDateString('ar-PS') : 'مستمر'}
                      </p>
                    </div>
                  </div>
                  {owner.national_id && (
                    <div className="mt-3 flex justify-center">
                      <CitizenQuickView 
                        nationalId={owner.national_id}
                        triggerText="عرض الملف الشامل"
                      >
                        <Button variant="outline" size="sm">
                          <User className="w-3 h-3 ml-2" />
                          عرض الملف الشامل
                        </Button>
                      </CitizenQuickView>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">لا يوجد ملاك سابقون</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleRecord;
