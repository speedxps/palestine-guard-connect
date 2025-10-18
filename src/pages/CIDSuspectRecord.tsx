import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CitizenRecordLayout } from '@/components/CitizenRecordLayout';
import { 
  FileText, TestTube, Users, ScanFace, 
  FileEdit, FolderOpen, Megaphone, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const CIDSuspectRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch citizen data
      const { data: citizenData, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', id)
        .single();

      if (citizenError) throw citizenError;

      if (!citizenData) {
        toast.error('لم يتم العثور على المشتبه');
        navigate('/department/cid/suspect-search');
        return;
      }

      setCitizen(citizenData);

      // Fetch related incidents
      const { data: incidentsData } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setIncidents(incidentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    { label: 'الحالة', value: 'قيد التحقيق' },
    { label: 'عدد البلاغات المرتبطة', value: incidents.length.toString() },
    { label: 'آخر تحديث', value: new Date(citizen.updated_at).toLocaleDateString('ar') },
  ];

  const actions = [
    {
      icon: <FileText className="h-12 w-12" />,
      label: 'البلاغات المرتبطة',
      onClick: () => navigate('/incidents'),
      color: 'text-primary'
    },
    {
      icon: <TestTube className="h-12 w-12" />,
      label: 'الأدلة الجنائية',
      onClick: () => navigate('/forensic-labs'),
      color: 'text-pink-500'
    },
    {
      icon: <Users className="h-12 w-12" />,
      label: 'الأشخاص المرتبطون',
      onClick: () => toast.info('قريباً: عرض الأشخاص المرتبطون'),
      color: 'text-primary'
    },
    {
      icon: <ScanFace className="h-12 w-12" />,
      label: 'التعرف على الوجه',
      onClick: () => navigate('/face-recognition'),
      color: 'text-pink-500'
    },
    {
      icon: <FileEdit className="h-12 w-12" />,
      label: 'ملاحظات التحقيق',
      onClick: () => toast.info('قريباً: إضافة ملاحظات التحقيق'),
      color: 'text-primary'
    },
    {
      icon: <FolderOpen className="h-12 w-12" />,
      label: 'ملفات القضية',
      onClick: () => toast.info('قريباً: عرض ملفات القضية'),
      color: 'text-orange-500'
    },
    {
      icon: <Megaphone className="h-12 w-12" />,
      label: 'إرسال تبليغ',
      onClick: () => {
        if (citizen.phone) {
          toast.success(`سيتم إرسال تبليغ إلى ${citizen.phone}`);
        } else {
          toast.error('رقم الهاتف غير متوفر');
        }
      },
      color: 'text-primary'
    },
    {
      icon: <XCircle className="h-12 w-12" />,
      label: 'إغلاق التحقيق',
      onClick: () => {
        toast.info('إغلاق التحقيق يتطلب موافقة المدير');
      },
      color: 'text-red-500'
    },
  ];

  return (
    <CitizenRecordLayout
      title={`المشتبه: ${citizen.full_name}`}
      subtitle="🕵️ Criminal Investigation Overview"
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

export default CIDSuspectRecord;
