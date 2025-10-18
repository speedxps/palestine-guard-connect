import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CitizenRecordLayout } from '@/components/CitizenRecordLayout';
import { 
  Car, FileText, MapPin, Camera, User, 
  FolderOpen, Bell, Settings 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const TrafficCitizenRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const fields = [
    { label: 'رقم الهوية', value: citizen.national_id, highlighted: true },
    { label: 'الاسم الكامل', value: citizen.full_name },
    { label: 'رقم الهاتف', value: citizen.phone || 'غير متوفر' },
    { label: 'العنوان', value: citizen.address || 'غير متوفر' },
    { label: 'تاريخ الميلاد', value: citizen.date_of_birth ? new Date(citizen.date_of_birth).toLocaleDateString('ar') : 'غير متوفر' },
    { label: 'الجنس', value: citizen.gender || 'غير متوفر' },
    { label: 'لديه مركبة', value: citizen.has_vehicle ? 'نعم' : 'لا' },
  ];

  const actions = [
    {
      icon: <Car className="h-12 w-12" />,
      label: 'تفاصيل المركبة',
      onClick: () => {
        if (citizen.has_vehicle) {
          navigate(`/vehicle-inquiry?id=${citizen.national_id}`);
        } else {
          toast.info('المواطن لا يمتلك مركبة مسجلة');
        }
      },
      color: 'text-primary'
    },
    {
      icon: <FileText className="h-12 w-12" />,
      label: 'سجل المخالفات',
      onClick: () => navigate(`/violations?search=${citizen.national_id}`),
      color: 'text-pink-500'
    },
    {
      icon: <MapPin className="h-12 w-12" />,
      label: 'العنوان على الخريطة',
      onClick: () => {
        if (citizen.address) {
          toast.success('فتح الخريطة...');
          // يمكن تطوير هذا لفتح خريطة حقيقية
        } else {
          toast.info('العنوان غير متوفر');
        }
      },
      color: 'text-primary'
    },
    {
      icon: <Camera className="h-12 w-12" />,
      label: 'رصد مخالفة جديدة',
      onClick: () => navigate('/violations-admin'),
      color: 'text-pink-500'
    },
    {
      icon: <User className="h-12 w-12" />,
      label: 'تفاصيل المواطن',
      onClick: () => navigate(`/civil-registry`),
      color: 'text-primary'
    },
    {
      icon: <FolderOpen className="h-12 w-12" />,
      label: 'الوثائق والملفات',
      onClick: () => toast.info('قريباً: عرض الوثائق والملفات'),
      color: 'text-orange-500'
    },
    {
      icon: <Bell className="h-12 w-12" />,
      label: 'إرسال إشعار',
      onClick: () => {
        if (citizen.phone) {
          toast.success(`سيتم إرسال إشعار إلى ${citizen.phone}`);
        } else {
          toast.error('رقم الهاتف غير متوفر');
        }
      },
      color: 'text-primary'
    },
    {
      icon: <Settings className="h-12 w-12" />,
      label: 'تعديل البيانات',
      onClick: () => navigate(`/civil-registry`),
      color: 'text-pink-500'
    },
  ];

  return (
    <CitizenRecordLayout
      title={`المواطن: ${citizen.full_name}`}
      subtitle="🚗 Vehicle & Violation Summary"
      fields={fields}
      actions={actions}
      onCallClick={() => {
        if (citizen.phone) {
          window.location.href = `tel:${citizen.phone}`;
        } else {
          toast.error('رقم الهاتف غير متوفر');
        }
      }}
    />
  );
};

export default TrafficCitizenRecord;
