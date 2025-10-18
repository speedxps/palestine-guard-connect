import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Car, FileText, MapPin, Camera, User, 
  FolderOpen, Bell, Settings, ArrowRight, Phone, X, PlusCircle
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
  
  // New violation form
  const [violationForm, setViolationForm] = useState({
    vehicle_id: '',
    violation_type: '',
    violation_date: new Date().toISOString().split('T')[0],
    location: '',
    fine_amount: 0,
    status: 'pending',
    notes: ''
  });
  
  // New vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    plate_number: '',
    vehicle_type: 'سيارة',
    color: '',
    model: '',
    year: new Date().getFullYear(),
    engine_number: '',
    chassis_number: '',
    status: 'active'
  });

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
      const { data: ownersData } = await supabase
        .from('vehicle_owners')
        .select('vehicle_id')
        .eq('national_id', citizen.national_id)
        .eq('is_current_owner', true);

      if (ownersData && ownersData.length > 0) {
        const vehicleIds = ownersData.map(o => o.vehicle_id);
        
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
      // البحث عن المركبات المملوكة من قبل هذا المواطن
      const { data: ownersData, error: ownersError } = await supabase
        .from('vehicle_owners')
        .select('vehicle_id')
        .eq('national_id', citizen.national_id)
        .eq('is_current_owner', true);

      if (ownersError) throw ownersError;

      if (ownersData && ownersData.length > 0) {
        const vehicleIds = ownersData.map(o => o.vehicle_id);
        
        // جلب بيانات المركبات
        const { data, error } = await supabase
          .from('vehicle_registrations')
          .select('*')
          .in('id', vehicleIds);

        if (error) throw error;
        setVehicles(data || []);
      } else {
        setVehicles([]);
      }
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
      case 'add-violation':
        await fetchVehicles();
        setActiveDialog('add-violation');
        break;
      case 'add-vehicle':
        setActiveDialog('add-vehicle');
        break;
      default:
        toast.info(`قريباً: ${action}`);
    }
  };

  const handleSaveViolation = async () => {
    try {
      if (!violationForm.vehicle_id || !violationForm.violation_type) {
        toast.error('يرجى تعبئة جميع الحقول المطلوبة');
        return;
      }

      const { error } = await supabase
        .from('vehicle_violations')
        .insert([violationForm]);

      if (error) throw error;

      toast.success('تم رصد المخالفة بنجاح');
      setActiveDialog(null);
      setViolationForm({
        vehicle_id: '',
        violation_type: '',
        violation_date: new Date().toISOString().split('T')[0],
        location: '',
        fine_amount: 0,
        status: 'pending',
        notes: ''
      });
      await fetchViolations();
    } catch (error) {
      console.error('Error saving violation:', error);
      toast.error('حدث خطأ أثناء حفظ المخالفة');
    }
  };

  const handleSaveVehicle = async () => {
    try {
      if (!vehicleForm.plate_number || !vehicleForm.model) {
        toast.error('يرجى تعبئة جميع الحقول المطلوبة');
        return;
      }

      // Insert vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicle_registrations')
        .insert([vehicleForm])
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // Create owner record
      const { error: ownerError } = await supabase
        .from('vehicle_owners')
        .insert([{
          vehicle_id: vehicleData.id,
          owner_name: citizen.full_name,
          national_id: citizen.national_id,
          phone: citizen.phone || '',
          address: citizen.address || '',
          ownership_start_date: new Date().toISOString().split('T')[0],
          is_current_owner: true
        }]);

      if (ownerError) throw ownerError;

      toast.success('تم إضافة المركبة بنجاح');
      setActiveDialog(null);
      setVehicleForm({
        plate_number: '',
        vehicle_type: 'سيارة',
        color: '',
        model: '',
        year: new Date().getFullYear(),
        engine_number: '',
        chassis_number: '',
        status: 'active'
      });
      await fetchVehicles();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast.error(error.message.includes('duplicate') ? 'رقم المركبة موجود مسبقاً' : 'حدث خطأ أثناء حفظ المركبة');
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
            onClick={() => handleActionClick('add-violation')}
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
            onClick={() => handleActionClick('add-vehicle')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <PlusCircle className="h-12 w-12 mb-4 text-green-500" />
              <p className="text-sm md:text-base font-semibold text-center">إضافة مركبة جديدة</p>
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
                        <p className="font-semibold">{vehicle.plate_number || 'غير محدد'}</p>
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
                        <p className="text-sm text-muted-foreground">السنة</p>
                        <p className="font-semibold">{vehicle.year || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">اللون</p>
                        <p className="font-semibold">{vehicle.color || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">رقم المحرك</p>
                        <p className="font-semibold">{vehicle.engine_number || 'غير محدد'}</p>
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
                        <p className="font-semibold">{violation.fine_amount || violation.amount || 0} ₪</p>
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

      {/* Add Violation Dialog */}
      <Dialog open={activeDialog === 'add-violation'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              رصد مخالفة جديدة
            </DialogTitle>
            <DialogDescription>
              رصد مخالفة لـ: {citizen.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicle">المركبة</Label>
              <Select
                value={violationForm.vehicle_id}
                onValueChange={(value) => setViolationForm(prev => ({ ...prev, vehicle_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate_number} - {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="violation_type">نوع المخالفة</Label>
              <Select
                value={violationForm.violation_type}
                onValueChange={(value) => setViolationForm(prev => ({ ...prev, violation_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المخالفة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تجاوز السرعة">تجاوز السرعة</SelectItem>
                  <SelectItem value="عدم ربط حزام الأمان">عدم ربط حزام الأمان</SelectItem>
                  <SelectItem value="استخدام الهاتف">استخدام الهاتف</SelectItem>
                  <SelectItem value="مخالفة إشارة مرورية">مخالفة إشارة مرورية</SelectItem>
                  <SelectItem value="وقوف خاطئ">وقوف خاطئ</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fine_amount">مبلغ الغرامة (₪)</Label>
                <Input
                  id="fine_amount"
                  type="number"
                  value={violationForm.fine_amount}
                  onChange={(e) => setViolationForm(prev => ({ ...prev, fine_amount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="violation_date">تاريخ المخالفة</Label>
                <Input
                  id="violation_date"
                  type="date"
                  value={violationForm.violation_date}
                  onChange={(e) => setViolationForm(prev => ({ ...prev, violation_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={violationForm.location}
                onChange={(e) => setViolationForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="أدخل موقع المخالفة"
              />
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={violationForm.notes}
                onChange={(e) => setViolationForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveViolation}>
                حفظ المخالفة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog open={activeDialog === 'add-vehicle'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              إضافة مركبة جديدة
            </DialogTitle>
            <DialogDescription>
              إضافة مركبة جديدة باسم: {citizen.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plate_number">رقم المركبة</Label>
                <Input
                  id="plate_number"
                  value={vehicleForm.plate_number}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, plate_number: e.target.value }))}
                  placeholder="مثال: 12345"
                />
              </div>
              <div>
                <Label htmlFor="vehicle_type">نوع المركبة</Label>
                <Select
                  value={vehicleForm.vehicle_type}
                  onValueChange={(value) => setVehicleForm(prev => ({ ...prev, vehicle_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="سيارة">سيارة</SelectItem>
                    <SelectItem value="دراجة نارية">دراجة نارية</SelectItem>
                    <SelectItem value="شاحنة">شاحنة</SelectItem>
                    <SelectItem value="حافلة">حافلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">الطراز</Label>
                <Input
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="مثال: تويوتا كامري"
                />
              </div>
              <div>
                <Label htmlFor="year">السنة</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">اللون</Label>
                <Input
                  id="color"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="مثال: أبيض"
                />
              </div>
              <div>
                <Label htmlFor="engine_number">رقم المحرك</Label>
                <Input
                  id="engine_number"
                  value={vehicleForm.engine_number}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, engine_number: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="chassis_number">رقم الشاسيه</Label>
              <Input
                id="chassis_number"
                value={vehicleForm.chassis_number}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, chassis_number: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveVehicle}>
                حفظ المركبة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrafficCitizenRecord;
