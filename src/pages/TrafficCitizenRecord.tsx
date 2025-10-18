import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Car, FileText, MapPin, Camera, User, 
  FolderOpen, Bell, Settings, ArrowRight, Phone, X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const TrafficCitizenRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // Data states
  const [violations, setViolations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCitizenData();
    }
  }, [id]);

  const fetchCitizenData = async () => {
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('لم يتم العثور على المواطن');
        navigate('/department/traffic/citizen-search');
        return;
      }

      setCitizen(data);
    } catch (error) {
      console.error('Error fetching citizen:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      // First get vehicles owned by this citizen
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id')
        .eq('owner_id', citizen.national_id);

      if (vehiclesData && vehiclesData.length > 0) {
        const vehicleIds = vehiclesData.map(v => v.id);
        
        // Then get violations for these vehicles
        const { data, error } = await supabase
          .from('vehicle_violations')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .order('violation_date', { ascending: false });

        if (error) throw error;
        setViolations(data || []);
      } else {
        setViolations([]);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
      toast.error('حدث خطأ أثناء جلب المخالفات');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchVehicles = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('owner_id', citizen.national_id);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('حدث خطأ أثناء جلب المركبات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleActionClick = async (action: string) => {
    switch (action) {
      case 'vehicles':
        await fetchVehicles();
        setActiveDialog('vehicles');
        break;
      case 'violations':
        await fetchViolations();
        setActiveDialog('violations');
        break;
      case 'location':
        setActiveDialog('location');
        break;
      case 'details':
        setActiveDialog('details');
        break;
      case 'documents':
        setActiveDialog('documents');
        break;
      case 'notification':
        setActiveDialog('notification');
        break;
      default:
        toast.info(`قريباً: ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!citizen) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <h1 className="text-xl md:text-2xl font-bold text-primary flex-1 text-center">
              المواطن: {citizen.full_name}
            </h1>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (citizen.phone) {
                  window.location.href = `tel:${citizen.phone}`;
                } else {
                  toast.error('رقم الهاتف غير متوفر');
                }
              }}
              className="text-primary hover:text-primary"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رقم الهوية</span>
                <span className="font-semibold text-primary text-lg">{citizen.national_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الاسم الكامل</span>
                <span className="font-semibold">{citizen.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رقم الهاتف</span>
                <span className="font-semibold">{citizen.phone || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">العنوان</span>
                <span className="font-semibold">{citizen.address || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">لديه مركبة</span>
                <Badge variant={citizen.has_vehicle ? 'default' : 'secondary'}>
                  {citizen.has_vehicle ? 'نعم' : 'لا'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-primary">
            🚗 Vehicle & Violation Summary
          </h2>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('vehicles')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Car className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">تفاصيل المركبة</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('violations')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FileText className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">سجل المخالفات</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('location')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <MapPin className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">العنوان على الخريطة</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => navigate('/violations-admin')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Camera className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">رصد مخالفة جديدة</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('details')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <User className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">تفاصيل المواطن</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('documents')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FolderOpen className="h-12 w-12 mb-4 text-orange-500" />
              <p className="text-sm md:text-base font-semibold text-center">الوثائق والملفات</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('notification')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Bell className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">إرسال إشعار</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => navigate('/civil-registry')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Settings className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">تعديل البيانات</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vehicles Dialog */}
      <Dialog open={activeDialog === 'vehicles'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              تفاصيل المركبات
            </DialogTitle>
            <DialogDescription>
              المركبات المسجلة باسم: {citizen.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">رقم المركبة</p>
                        <p className="font-semibold">{vehicle.license_plate || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">نوع المركبة</p>
                        <p className="font-semibold">{vehicle.vehicle_type || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">الموديل</p>
                        <p className="font-semibold">{vehicle.model || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ الشراء</p>
                        <p className="font-semibold">
                          {vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString('ar') : 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مركبات مسجلة
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Violations Dialog */}
      <Dialog open={activeDialog === 'violations'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              سجل المخالفات
            </DialogTitle>
            <DialogDescription>
              المخالفات المسجلة على: {citizen.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : violations.length > 0 ? (
            <div className="space-y-4">
              {violations.map((violation) => (
                <Card key={violation.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">نوع المخالفة</p>
                        <p className="font-semibold">{violation.violation_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">الحالة</p>
                        <Badge variant={violation.status === 'paid' ? 'default' : 'destructive'}>
                          {violation.status === 'paid' ? 'مدفوعة' : violation.status === 'pending' ? 'معلقة' : 'غير مدفوعة'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">المبلغ</p>
                        <p className="font-semibold">{violation.amount} ₪</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">التاريخ</p>
                        <p className="font-semibold">
                          {new Date(violation.violation_date).toLocaleDateString('ar')}
                        </p>
                      </div>
                      {violation.location && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">الموقع</p>
                          <p className="font-semibold">{violation.location}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مخالفات مسجلة
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={activeDialog === 'details'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              تفاصيل المواطن
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الاسم الأول</p>
                <p className="font-semibold">{citizen.first_name || 'غير متوفر'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">اسم الأب</p>
                <p className="font-semibold">{citizen.father_name || 'غير متوفر'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">اسم العائلة</p>
                <p className="font-semibold">{citizen.family_name || 'غير متوفر'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                <p className="font-semibold">
                  {citizen.date_of_birth ? new Date(citizen.date_of_birth).toLocaleDateString('ar') : 'غير متوفر'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الجنس</p>
                <p className="font-semibold">{citizen.gender || 'غير متوفر'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-semibold">{citizen.phone || 'غير متوفر'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">العنوان</p>
              <p className="font-semibold">{citizen.address || 'غير متوفر'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={activeDialog === 'location'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              العنوان على الخريطة
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              العنوان: {citizen.address || 'غير متوفر'}
            </p>
            <p className="text-sm text-muted-foreground">
              قريباً: عرض الموقع على الخريطة التفاعلية
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={activeDialog === 'documents'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              الوثائق والملفات
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8 text-muted-foreground">
            قريباً: عرض الوثائق والملفات المرتبطة بالمواطن
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={activeDialog === 'notification'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              إرسال إشعار
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">المستلم:</p>
              <p className="font-semibold">{citizen.full_name}</p>
              <p className="text-sm text-muted-foreground">{citizen.phone || 'رقم الهاتف غير متوفر'}</p>
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                if (citizen.phone) {
                  toast.success(`سيتم إرسال إشعار إلى ${citizen.phone}`);
                  setActiveDialog(null);
                } else {
                  toast.error('رقم الهاتف غير متوفر');
                }
              }}
            >
              إرسال الإشعار
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrafficCitizenRecord;
