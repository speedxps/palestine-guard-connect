import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, Car, AlertTriangle, Laptop, Scale, 
  FileText, Camera 
} from 'lucide-react';

interface CitizenQuickViewProps {
  nationalId: string;
  children?: React.ReactNode;
  triggerText?: string;
}

interface QuickData {
  citizen: any;
  vehiclesCount: number;
  violationsCount: number;
  cyberCasesCount: number;
  judicialCasesCount: number;
  isWanted: boolean;
}

export function CitizenQuickView({ 
  nationalId, 
  children, 
  triggerText = "عرض الملف السريع" 
}: CitizenQuickViewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QuickData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && !data) {
      fetchQuickData();
    }
  }, [open]);

  const fetchQuickData = async () => {
    setLoading(true);
    try {
      // جلب بيانات المواطن
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq('national_id', nationalId)
        .single();

      if (citizenError || !citizen) {
        console.error('Error fetching citizen:', citizenError);
        return;
      }

      // جلب الإحصائيات بالتوازي
      const [
        vehiclesRes,
        violationsRes,
        cyberCasesRes,
        judicialCasesRes,
        wantedRes
      ] = await Promise.all([
        supabase
          .from('vehicle_owners')
          .select('id', { count: 'exact', head: true })
          .eq('national_id', nationalId),
        
        supabase
          .from('traffic_records')
          .select('id', { count: 'exact', head: true })
          .eq('national_id', nationalId),
        
        supabase
          .from('cybercrime_cases')
          .select('id', { count: 'exact', head: true })
          .eq('national_id', nationalId),
        
        supabase
          .from('judicial_cases')
          .select('id', { count: 'exact', head: true })
          .eq('national_id', nationalId),
        
        supabase
          .from('wanted_persons')
          .select('id')
          .eq('citizen_id', citizen.id)
          .maybeSingle()
      ]);

      setData({
        citizen,
        vehiclesCount: vehiclesRes.count || 0,
        violationsCount: violationsRes.count || 0,
        cyberCasesCount: cyberCasesRes.count || 0,
        judicialCasesCount: judicialCasesRes.count || 0,
        isWanted: !!wantedRes.data
      });
    } catch (error) {
      console.error('Error fetching quick data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullProfile = () => {
    setOpen(false);
    navigate(`/citizen-profile/${nationalId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 ml-2" />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>معلومات سريعة</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-32 rounded-lg mx-auto" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* الصورة والبيانات الأساسية */}
            <div className="flex flex-col items-center text-center">
              {data.citizen.photo_url ? (
                <img
                  src={data.citizen.photo_url}
                  alt={data.citizen.full_name}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-primary mb-3"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              
              <h3 className="text-xl font-bold">{data.citizen.full_name}</h3>
              <p className="text-muted-foreground">رقم الهوية: {nationalId}</p>
              
              {data.isWanted && (
                <Badge variant="destructive" className="mt-2">
                  🚨 مطلوب
                </Badge>
              )}
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Car className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">المركبات</p>
                  <p className="text-lg font-bold">{data.vehiclesCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">المخالفات</p>
                  <p className="text-lg font-bold">{data.violationsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Laptop className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">جرائم إلكترونية</p>
                  <p className="text-lg font-bold">{data.cyberCasesCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Scale className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">قضايا قضائية</p>
                  <p className="text-lg font-bold">{data.judicialCasesCount}</p>
                </div>
              </div>
            </div>

            {/* معلومات إضافية */}
            {data.citizen.phone && (
              <div className="text-sm">
                <span className="font-semibold">الهاتف:</span>
                <span className="mr-2">{data.citizen.phone}</span>
              </div>
            )}

            {data.citizen.address && (
              <div className="text-sm">
                <span className="font-semibold">العنوان:</span>
                <span className="mr-2">{data.citizen.address}</span>
              </div>
            )}

            {/* زر الملف الشامل */}
            <Button 
              onClick={handleViewFullProfile}
              className="w-full"
              size="lg"
            >
              <FileText className="w-4 h-4 ml-2" />
              عرض الملف الشامل
            </Button>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">لم يتم العثور على بيانات</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
