import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Search, Car, User, AlertTriangle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PrintService } from '@/components/PrintService';
import { BackButton } from '@/components/BackButton';
import { useTickets } from '@/hooks/useTickets';

interface VehicleData {
  id: string;
  plate_number: string;
  vehicle_type: string;
  color: string;
  model: string;
  year: number;
  engine_number: string;
  chassis_number: string;
  registration_date: string;
  status: string;
}

interface OwnerData {
  id: string;
  owner_name: string;
  national_id: string;
  phone: string;
  address: string;
  ownership_start_date: string;
  ownership_end_date?: string;
  is_current_owner: boolean;
}

interface ViolationData {
  id: string;
  violation_type: string;
  violation_date: string;
  location: string;
  fine_amount: number;
  status: string;
  notes?: string;
}

export default function VehicleInquiry() {
  const { toast } = useToast();
  const { logTicket } = useTickets();
  const [plateNumber, setPlateNumber] = useState('');
  const [ownerNationalId, setOwnerNationalId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [searchType, setSearchType] = useState<'plate' | 'national_id' | 'name'>('plate');
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [violations, setViolations] = useState<ViolationData[]>([]);

  const searchVehicle = async () => {
    // Validation based on search type
    if (searchType === 'plate' && !plateNumber.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم المركبة",
        variant: "destructive"
      });
      return;
    }
    if (searchType === 'national_id' && !ownerNationalId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم هوية المالك",
        variant: "destructive"
      });
      return;
    }
    if (searchType === 'name' && !ownerName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المالك",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      let vehicleResponse: any = null;
      let ownersResponse: any[] = [];

      if (searchType === 'plate') {
        // البحث برقم المركبة
        const { data, error } = await supabase
          .from('vehicle_registrations')
          .select('*')
          .eq('plate_number', plateNumber.trim())
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast({
            title: "غير موجود",
            description: "لم يتم العثور على مركبة بهذا الرقم",
            variant: "destructive"
          });
          setVehicleData(null);
          setOwners([]);
          setViolations([]);
          setIsSearching(false);
          return;
        }
        vehicleResponse = data;
      } else if (searchType === 'national_id') {
        // البحث برقم هوية المالك
        // 1. البحث عن المالك برقم الهوية
        const { data: ownerData, error: ownerError } = await supabase
          .from('vehicle_owners')
          .select('vehicle_id, *')
          .eq('national_id', ownerNationalId.trim())
          .eq('is_current_owner', true);

        if (ownerError) throw ownerError;
        if (!ownerData || ownerData.length === 0) {
          toast({
            title: "غير موجود",
            description: "لم يتم العثور على مركبة مسجلة بهذا الرقم الوطني",
            variant: "destructive"
          });
          setVehicleData(null);
          setOwners([]);
          setViolations([]);
          setIsSearching(false);
          return;
        }

        // 2. جلب بيانات المركبة
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicle_registrations')
          .select('*')
          .eq('id', ownerData[0].vehicle_id)
          .single();

        if (vehicleError) throw vehicleError;
        vehicleResponse = vehicleData;
        ownersResponse = ownerData;
      } else if (searchType === 'name') {
        // البحث باسم المالك
        // 1. البحث عن المالك بالاسم
        const { data: ownerData, error: ownerError } = await supabase
          .from('vehicle_owners')
          .select('vehicle_id, *')
          .ilike('owner_name', `%${ownerName.trim()}%`)
          .eq('is_current_owner', true);

        if (ownerError) throw ownerError;
        if (!ownerData || ownerData.length === 0) {
          toast({
            title: "غير موجود",
            description: "لم يتم العثور على مركبة مسجلة بهذا الاسم",
            variant: "destructive"
          });
          setVehicleData(null);
          setOwners([]);
          setViolations([]);
          setIsSearching(false);
          return;
        }

        // 2. جلب بيانات المركبة
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicle_registrations')
          .select('*')
          .eq('id', ownerData[0].vehicle_id)
          .single();

        if (vehicleError) throw vehicleError;
        vehicleResponse = vehicleData;
        ownersResponse = ownerData;
      }

      setVehicleData(vehicleResponse);

      // Fetch owners data if not already loaded
      if (ownersResponse.length === 0) {
        const { data: allOwners, error: ownersError } = await supabase
          .from('vehicle_owners')
          .select('*')
          .eq('vehicle_id', vehicleResponse.id)
          .order('ownership_start_date', { ascending: false });

        if (ownersError) throw ownersError;
        setOwners(allOwners || []);
      } else {
        // إذا كانت البيانات محملة من البحث، جلب باقي المالكين
        const { data: allOwners, error: ownersError } = await supabase
          .from('vehicle_owners')
          .select('*')
          .eq('vehicle_id', vehicleResponse.id)
          .order('ownership_start_date', { ascending: false });

        if (ownersError) throw ownersError;
        setOwners(allOwners || []);
      }

      // Fetch violations data
      const { data: violationsResponse, error: violationsError } = await supabase
        .from('vehicle_violations')
        .select('*')
        .eq('vehicle_id', vehicleResponse.id)
        .order('violation_date', { ascending: false });

      if (violationsError) throw violationsError;
      setViolations(violationsResponse || []);

      toast({
        title: "تم العثور على المركبة",
        description: `تم العثور على ${vehicleResponse.vehicle_type} رقم ${vehicleResponse.plate_number}`,
      });
      
      // Log ticket
      await logTicket({
        section: 'الإستعلام عن المركبات',
        action_type: 'view',
        description: `البحث عن مركبة: ${vehicleResponse.plate_number}`,
        metadata: { 
          searchType, 
          plateNumber: vehicleResponse.plate_number, 
          violationsCount: violationsResponse?.length || 0 
        }
      });

    } catch (error) {
      console.error('Error searching vehicle:', error);
      toast({
        title: "خطأ",
        description: "فشل في البحث عن المركبة",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getViolationStatusColor = (status: string) => {
    switch (status) {
      case 'مدفوع': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'منتهي': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const currentOwner = owners.find(owner => owner.is_current_owner);
  const previousOwners = owners.filter(owner => !owner.is_current_owner);
  const pendingViolations = violations.filter(v => v.status === 'pending');

  const generatePrintContent = () => {
    if (!vehicleData) return 'لا توجد بيانات للطباعة';
    
    const currentDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `
      <div style="direction: rtl; font-family: 'Noto Sans Arabic', Arial, sans-serif; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 20px;">
          <h2 style="color: #1e40af; margin-bottom: 10px; font-size: 24px;">
            تقرير استعلام مركبة رقم ${vehicleData.plate_number}
          </h2>
          <p style="color: #6b7280; font-size: 14px;">الشرطة الفلسطينية - نظام إدارة المركبات</p>
          <p style="color: #6b7280; font-size: 12px;">تاريخ التقرير: ${currentDate}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #1e40af;">
          <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 18px;">معلومات المركبة:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; width: 35%; background: #f3f4f6;">رقم اللوحة:</td>
              <td style="padding: 10px; color: #1e40af; font-weight: bold;">${vehicleData.plate_number}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">نوع المركبة:</td>
              <td style="padding: 10px;">${vehicleData.vehicle_type}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">الطراز:</td>
              <td style="padding: 10px;">${vehicleData.model}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">سنة الصنع:</td>
              <td style="padding: 10px;">${vehicleData.year}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">اللون:</td>
              <td style="padding: 10px;">${vehicleData.color}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">الحالة:</td>
              <td style="padding: 10px;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${vehicleData.status === 'active' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #dc2626;'}">
                  ${vehicleData.status === 'active' ? 'نشط' : vehicleData.status}
                </span>
              </td>
            </tr>
            ${vehicleData.engine_number ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">رقم المحرك:</td>
              <td style="padding: 10px;">${vehicleData.engine_number}</td>
            </tr>
            ` : ''}
            ${vehicleData.chassis_number ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">رقم الشاصي:</td>
              <td style="padding: 10px;">${vehicleData.chassis_number}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">تاريخ الترخيص:</td>
              <td style="padding: 10px;">${new Date(vehicleData.registration_date).toLocaleDateString('ar-SA')}</td>
            </tr>
          </table>
        </div>
        
        ${currentOwner ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 18px;">معلومات المالك الحالي:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; width: 35%; background: #f3f4f6;">الاسم الكامل:</td>
              <td style="padding: 10px; color: #1e40af; font-weight: bold;">${currentOwner.owner_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">رقم الهوية:</td>
              <td style="padding: 10px;">${currentOwner.national_id}</td>
            </tr>
            ${currentOwner.phone ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">رقم الهاتف:</td>
              <td style="padding: 10px;">${currentOwner.phone}</td>
            </tr>
            ` : ''}
            ${currentOwner.address ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">العنوان:</td>
              <td style="padding: 10px;">${currentOwner.address}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; font-weight: bold; background: #f3f4f6;">تاريخ بداية الملكية:</td>
              <td style="padding: 10px;">${new Date(currentOwner.ownership_start_date).toLocaleDateString('ar-SA')}</td>
            </tr>
          </table>
        </div>
        ` : '<div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;"><p style="color: #dc2626;">لا يوجد مالك مسجل حالياً لهذه المركبة</p></div>'}
        
        ${previousOwners.length > 0 ? `
        <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #eab308;">
          <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 18px;">تاريخ الملكية السابقة (${previousOwners.length} مالك):</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">الاسم</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">رقم الهوية</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">من تاريخ</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">إلى تاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${previousOwners.map((owner, index) => `
                <tr style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${owner.owner_name}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${owner.national_id}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(owner.ownership_start_date).toLocaleDateString('ar-SA')}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${owner.ownership_end_date ? new Date(owner.ownership_end_date).toLocaleDateString('ar-SA') : 'مستمر'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #dc2626;">
          <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 18px;">سجل المخالفات:</h3>
          ${violations.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #fee2e2;">
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">نوع المخالفة</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">التاريخ</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">المكان</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">الغرامة</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${violations.map((violation, index) => `
                  <tr style="background: ${index % 2 === 0 ? '#fef2f2' : 'white'};">
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${violation.violation_type}</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(violation.violation_date).toLocaleDateString('ar-SA')}</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${violation.location || 'غير محدد'}</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${violation.fine_amount || 0} ش.ج</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">
                      <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${violation.status === 'pending' ? 'background: #fef3c7; color: #d97706;' : 'background: #dcfce7; color: #166534;'}">
                        ${violation.status === 'pending' ? 'معلقة' : violation.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
              <h4 style="color: #dc2626; margin-bottom: 10px; font-size: 16px;">ملخص إحصائي للمخالفات:</h4>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                <div style="background: white; padding: 10px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${violations.length}</div>
                  <div style="font-size: 12px; color: #6b7280;">إجمالي المخالفات</div>
                </div>
                <div style="background: white; padding: 10px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #d97706;">${pendingViolations.length}</div>
                  <div style="font-size: 12px; color: #6b7280;">المخالفات المعلقة</div>
                </div>
                <div style="background: white; padding: 10px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${pendingViolations.reduce((sum, v) => sum + (v.fine_amount || 0), 0)} ش.ج</div>
                  <div style="font-size: 12px; color: #6b7280;">إجمالي الغرامات المعلقة</div>
                </div>
              </div>
            </div>
          ` : '<div style="text-align: center; padding: 30px; background: #dcfce7; border-radius: 8px;"><p style="color: #166534; font-size: 16px;"><strong>✅ لا توجد مخالفات مسجلة</strong></p><p style="color: #6b7280; font-size: 14px; margin-top: 5px;">هذه المركبة لديها سجل نظيف</p></div>'}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="color: #1e40af; margin-bottom: 10px;">ملاحظات هامة:</h4>
            <ul style="text-align: right; color: #6b7280; font-size: 14px; line-height: 1.8;">
              <li>هذا التقرير يعكس حالة المركبة وقت الاستعلام فقط</li>
              <li>يجب التأكد من تحديث بيانات المركبة دورياً</li>
              <li>في حالة وجود مخالفات معلقة، يجب تسديدها لتجنب المضاعفات القانونية</li>
              <li>هذا التقرير صالح لمدة 30 يوماً من تاريخ الإصدار</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin: 10px 0;">تم إنشاء هذا التقرير بتاريخ: ${currentDate}</p>
          <p style="color: #6b7280; font-size: 12px;">الشرطة الفلسطينية - نظام إدارة المركبات الإلكتروني</p>
          <p style="color: #6b7280; font-size: 10px; margin-top: 10px;">رقم التقرير: VR-${Date.now().toString().slice(-6)} | هذا تقرير رسمي</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground">الإستعلام عن المركبات</h1>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث عن مركبة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="plateNumber">رقم المركبة</Label>
            <div className="flex gap-2">
              <Input
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="أدخل رقم المركبة (مثال: H2001, 123456789, A5555)"
                onKeyPress={(e) => e.key === 'Enter' && searchVehicle()}
                className="flex-1"
              />
              <Button 
                onClick={searchVehicle}
                disabled={isSearching}
                className="bg-primary hover:bg-primary/90"
              >
                {isSearching ? 'جاري البحث...' : 'بحث'}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>أمثلة للتجربة:</strong> H2001, 123456789, A5555</p>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {vehicleData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-foreground">نتائج البحث</h2>
            <PrintService
              title={`تقرير استعلام مركبة رقم ${vehicleData.plate_number}`}
              content={generatePrintContent()}
              pageTitle="استعلام المركبات"
              department="الشرطة الفلسطينية"
              documentType="تقرير استعلام مركبة"
            />
          </div>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                معلومات المركبة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">رقم اللوحة</Label>
                  <p className="text-lg font-semibold">{vehicleData.plate_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">نوع المركبة</Label>
                  <p className="text-lg">{vehicleData.vehicle_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">الطراز</Label>
                  <p className="text-lg">{vehicleData.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">السنة</Label>
                  <p className="text-lg">{vehicleData.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">اللون</Label>
                  <p className="text-lg">{vehicleData.color}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">الحالة</Label>
                  <Badge variant={vehicleData.status === 'active' ? 'default' : 'secondary'}>
                    {vehicleData.status === 'active' ? 'نشط' : vehicleData.status}
                  </Badge>
                </div>
                {vehicleData.engine_number && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">رقم المحرك</Label>
                    <p className="text-lg">{vehicleData.engine_number}</p>
                  </div>
                )}
                {vehicleData.chassis_number && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">رقم الشاصي</Label>
                    <p className="text-lg">{vehicleData.chassis_number}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">تاريخ الترخيص</Label>
                  <p className="text-lg">{new Date(vehicleData.registration_date).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Owner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                المالك الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentOwner ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
                    <p className="text-lg font-semibold">{currentOwner.owner_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">رقم الهوية</Label>
                    <p className="text-lg">{currentOwner.national_id}</p>
                  </div>
                  {currentOwner.phone && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">الهاتف</Label>
                      <p className="text-lg">{currentOwner.phone}</p>
                    </div>
                  )}
                  {currentOwner.address && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">العنوان</Label>
                      <p className="text-lg">{currentOwner.address}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">تاريخ بداية الملكية</Label>
                    <p className="text-lg">{new Date(currentOwner.ownership_start_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">لا يوجد مالك مسجل حالياً</p>
              )}
            </CardContent>
          </Card>

          {/* Previous Owners */}
          {previousOwners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الملاك السابقين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previousOwners.map((owner) => (
                    <div key={owner.id} className="border rounded-lg p-4 space-y-2">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
                          <p className="font-semibold">{owner.owner_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">رقم الهوية</Label>
                          <p>{owner.national_id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">فترة الملكية</Label>
                          <p>
                            من {new Date(owner.ownership_start_date).toLocaleDateString('ar-SA')} 
                            {owner.ownership_end_date && ` إلى ${new Date(owner.ownership_end_date).toLocaleDateString('ar-SA')}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Violations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                المخالفات
                {pendingViolations.length > 0 && (
                  <Badge variant="destructive">{pendingViolations.length} معلقة</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violations.length > 0 ? (
                <div className="space-y-4">
                  {pendingViolations.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="mr-3">
                          <p className="text-sm text-red-700">
                            <strong>تحذير:</strong> توجد {pendingViolations.length} مخالفة معلقة بإجمالي {pendingViolations.reduce((sum, v) => sum + v.fine_amount, 0)} شيكل
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {violations.map((violation) => (
                      <div key={violation.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{violation.violation_type}</h4>
                              <Badge className={getViolationStatusColor(violation.status)}>
                                {violation.status === 'pending' ? 'معلقة' : violation.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <Label className="text-muted-foreground">التاريخ</Label>
                                <p>{new Date(violation.violation_date).toLocaleDateString('ar-SA')}</p>
                              </div>
                              {violation.location && (
                                <div>
                                  <Label className="text-muted-foreground">المكان</Label>
                                  <p>{violation.location}</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-muted-foreground">الغرامة</Label>
                                <p className="font-semibold">{violation.fine_amount} ش.ج</p>
                              </div>
                            </div>
                            {violation.notes && (
                              <div>
                                <Label className="text-muted-foreground">ملاحظات</Label>
                                <p className="text-sm">{violation.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-muted-foreground">إجمالي المخالفات</p>
                      <p className="text-2xl font-bold text-blue-600">{violations.length}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-sm text-muted-foreground">المخالفات المعلقة</p>
                      <p className="text-2xl font-bold text-yellow-600">{pendingViolations.length}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm text-muted-foreground">إجمالي الغرامات المعلقة</p>
                      <p className="text-2xl font-bold text-red-600">{pendingViolations.reduce((sum, v) => sum + v.fine_amount, 0)} ش.ج</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد مخالفات</h3>
                  <p className="text-muted-foreground">لا توجد مخالفات مسجلة لهذه المركبة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}