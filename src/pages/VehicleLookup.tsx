import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Car, User, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VehicleLookup = () => {
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const searchVehicle = async () => {
    if (!plateNumber) {
      toast.error('يرجى إدخال رقم اللوحة');
      return;
    }

    setLoading(true);
    try {
      // البحث عن السيارة
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate_number', plateNumber)
        .single();

      if (vehicleError) {
        toast.error('لم يتم العثور على السيارة');
        setVehicleData(null);
        setOwnerData(null);
        return;
      }

      setVehicleData(vehicle);

      // البحث عن بيانات المالك
      if (vehicle.owner_id) {
        const { data: owner, error: ownerError } = await supabase
          .from('citizens')
          .select('*')
          .eq('id', vehicle.owner_id)
          .single();

        if (!ownerError && owner) {
          setOwnerData(owner);
        }
      }

      toast.success('تم العثور على السيارة');
    } catch (error) {
      console.error('Error searching vehicle:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">الاستعلام عن السيارات</h1>
        <p className="text-muted-foreground">ابحث عن بيانات السيارة ومالكها باستخدام رقم اللوحة</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="أدخل رقم اللوحة"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="flex-1"
              dir="rtl"
            />
            <Button onClick={searchVehicle} disabled={loading}>
              {loading ? 'جاري البحث...' : 'بحث'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {vehicleData && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                بيانات السيارة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">رقم اللوحة</label>
                  <p className="font-medium">{vehicleData.plate_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">نوع المركبة</label>
                  <p className="font-medium">{vehicleData.vehicle_type || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">اللون</label>
                  <p className="font-medium">{vehicleData.color || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">تاريخ الشراء</label>
                  <p className="font-medium">
                    {vehicleData.purchase_date ? new Date(vehicleData.purchase_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {ownerData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  بيانات المالك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  {ownerData.photo_url && (
                    <img
                      src={ownerData.photo_url}
                      alt="صورة المالك"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{ownerData.full_name}</h3>
                    <p className="text-muted-foreground">{ownerData.national_id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">الجنس</label>
                    <p className="font-medium">{ownerData.gender === 'male' ? 'ذكر' : ownerData.gender === 'female' ? 'أنثى' : 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">تاريخ الميلاد</label>
                    <p className="font-medium">
                      {ownerData.date_of_birth ? new Date(ownerData.date_of_birth).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleLookup;