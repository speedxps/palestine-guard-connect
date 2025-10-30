import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, TestTube, Users, ScanFace, 
  FileEdit, FolderOpen, Megaphone, XCircle, Phone, 
  Calendar as CalendarIcon, Copy, Trash2, History, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { useTickets } from '@/hooks/useTickets';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// القوالب الجاهزة للتبليغات الرسمية
const notificationTemplates = [
  {
    id: 'court_summons',
    title: 'استدعاء للمحكمة',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنحيطكم علماً بوجوب حضوركم إلى المحكمة بتاريخ {date} يوم {day} الساعة {time} للنظر في القضية رقم [رقم القضية].\n\nعدم الحضور يعرضكم للمساءلة القانونية.\n\nالشرطة الفلسطينية - الجنائية'
  },
  {
    id: 'investigation_summons',
    title: 'استدعاء للتحقيق',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nيرجى الحضور لمقر الشرطة - قسم المباحث الجنائية بتاريخ {date} يوم {day} الساعة {time} للإدلاء بأقوالكم في قضية رقم [رقم القضية].\n\nالشرطة الفلسطينية - المباحث الجنائية'
  },
  {
    id: 'arrest_warrant',
    title: 'إشعار بمذكرة توقيف',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنعلمكم بصدور أمر توقيف بحقكم من النيابة العامة رقم [رقم الأمر] بتاريخ {date}.\n\nيتوجب عليكم التسليم طوعاً لأقرب مركز شرطة خلال 48 ساعة.\n\nالشرطة الفلسطينية'
  },
  {
    id: 'witness_summons',
    title: 'استدعاء شاهد',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنرجو التكرم بالحضور إلى قسم المباحث الجنائية بصفتكم شاهد في القضية رقم [رقم القضية] وذلك بتاريخ {date} يوم {day} الساعة {time}.\n\nالشرطة الفلسطينية - المباحث الجنائية'
  },
  {
    id: 'travel_ban',
    title: 'إشعار بمنع السفر',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنعلمكم بصدور قرار منع السفر بحقكم من النيابة العامة رقم [رقم القرار] بتاريخ {date} لحين انتهاء التحقيقات في القضية رقم [رقم القضية].\n\nالشرطة الفلسطينية'
  },
  {
    id: 'case_closed',
    title: 'إشعار بإغلاق القضية',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنعلمكم بأنه تم إغلاق القضية رقم [رقم القضية] المتعلقة بكم بتاريخ {date} لعدم كفاية الأدلة / لانتهاء التحقيقات.\n\nالشرطة الفلسطينية - المباحث الجنائية'
  },
  {
    id: 'bail_release',
    title: 'إشعار بالإفراج بكفالة',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنعلمكم بقرار الإفراج عنكم بكفالة مالية قدرها [المبلغ] شيكل بتاريخ {date} في القضية رقم [رقم القضية].\n\nيرجى مراجعة قسم المباحث كل [المدة] حسب شروط الكفالة.\n\nالشرطة الفلسطينية - المباحث الجنائية'
  },
  {
    id: 'house_arrest',
    title: 'إشعار بالإقامة الجبرية',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنعلمكم بقرار فرض الإقامة الجبرية عليكم في عنوان إقامتكم [العنوان] اعتباراً من تاريخ {date} وحتى إشعار آخر.\n\nمنعاً باتاً من مغادرة العنوان دون إذن مسبق.\n\nالشرطة الفلسطينية'
  },
  {
    id: 'interrogation_appointment',
    title: 'موعد استجواب',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nتم تحديد موعد لاستجوابكم في القضية رقم [رقم القضية] بحضور المحامي يوم {day} بتاريخ {date} الساعة {time}.\n\nمن حقكم الاستعانة بمحامٍ.\n\nالشرطة الفلسطينية - المباحث الجنائية'
  },
  {
    id: 'evidence_viewing',
    title: 'دعوة لمشاهدة الأدلة',
    template: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nندعوكم لحضور جلسة مشاهدة الأدلة في القضية رقم [رقم القضية] بحضور محاميكم بتاريخ {date} يوم {day} الساعة {time}.\n\nالشرطة الفلسطينية - المباحث الجنائية'
  }
];

// أيام الأسبوع بالعربية
const arabicDays = [
  { value: 'saturday', label: 'السبت' },
  { value: 'sunday', label: 'الأحد' },
  { value: 'monday', label: 'الاثنين' },
  { value: 'tuesday', label: 'الثلاثاء' },
  { value: 'wednesday', label: 'الأربعاء' },
  { value: 'thursday', label: 'الخميس' },
  { value: 'friday', label: 'الجمعة' }
];

const CIDSuspectRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // Data states
  const [incidents, setIncidents] = useState<any[]>([]);
  const [forensicEvidence, setForensicEvidence] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [previousNotes, setPreviousNotes] = useState<any[]>([]);
  const [closureRequests, setClosureRequests] = useState<any[]>([]);
  const [closureReason, setClosureReason] = useState('');
  const [faceRecognitionImage, setFaceRecognitionImage] = useState<string | null>(null);
  const [faceRecognitionResults, setFaceRecognitionResults] = useState<any[]>([]);
  const [recognitionLoading, setRecognitionLoading] = useState(false);
  const [regeneratingEmbedding, setRegeneratingEmbedding] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // Notification states
  const [notificationText, setNotificationText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customDate, setCustomDate] = useState<Date>();
  const [customDay, setCustomDay] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  
  const { searchFaces } = useFaceRecognition();
  const { logTicket } = useTickets();

  const regenerateFaceEmbedding = async () => {
    if (!citizen?.photo_url) {
      toast.error('لا توجد صورة للمشتبه لتوليد embedding');
      return;
    }

    setRegeneratingEmbedding(true);
    try {
      // تحويل URL الصورة إلى base64
      const response = await fetch(citizen.photo_url);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // استدعاء edge function لتوليد embedding
      const { data, error } = await supabase.functions.invoke('generate-face-embedding', {
        body: { citizenId: citizen.id, imageBase64: base64 }
      });

      if (error) throw error;

      toast.success('تم تحديث بيانات التعرف على الوجه بنجاح');
      await fetchData(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('Error regenerating face embedding:', error);
      toast.error('حدث خطأ أثناء تحديث بيانات التعرف على الوجه');
    } finally {
      setRegeneratingEmbedding(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      // جلب البلاغات المرتبطة بالمشتبه - البلاغات التي يحتوي وصفها أو عنوانها على اسم المشتبه أو رقم هويته
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .or(`description.ilike.%${citizen.full_name}%,description.ilike.%${citizen.national_id}%,title.ilike.%${citizen.full_name}%,title.ilike.%${citizen.national_id}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('حدث خطأ أثناء جلب البلاغات');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchForensicEvidence = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('forensic_evidence')
        .select('*')
        .order('collection_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setForensicEvidence(data || []);
    } catch (error) {
      console.error('Error fetching forensic evidence:', error);
      toast.error('حدث خطأ أثناء جلب الأدلة الجنائية');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchFamilyMembers = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('person_id', citizen.id);

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('حدث خطأ أثناء جلب أفراد العائلة');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPreviousNotes = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('investigation_notes')
        .select(`
          *,
          creator:profiles!investigation_notes_created_by_fkey(full_name)
        `)
        .eq('citizen_id', citizen.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }
      
      console.log('Fetched notes:', data);
      setPreviousNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('حدث خطأ أثناء جلب الملاحظات');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchClosureRequests = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('investigation_closure_requests')
        .select(`
          *,
          requester:profiles!investigation_closure_requests_requested_by_fkey(full_name),
          reviewer:profiles!investigation_closure_requests_reviewed_by_fkey(full_name)
        `)
        .eq('citizen_id', citizen.id)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching closure requests:', error);
        throw error;
      }
      
      console.log('Fetched closure requests:', data);
      setClosureRequests(data || []);
    } catch (error) {
      console.error('Error fetching closure requests:', error);
      toast.error('حدث خطأ أثناء جلب سجلات الإغلاق');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveNote = async () => {
    if (!notes.trim()) {
      toast.error('الرجاء إدخال ملاحظات');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('investigation_notes')
        .insert({
          citizen_id: citizen.id,
          note_text: notes,
          created_by: profile.id
        });

      if (error) throw error;

      toast.success('تم حفظ الملاحظات بنجاح');
      setNotes('');
      await fetchPreviousNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('حدث خطأ أثناء حفظ الملاحظات');
    }
  };

  const handleCloseInvestigation = async () => {
    if (!closureReason.trim()) {
      toast.error('الرجاء إدخال سبب الإغلاق');
      return;
    }

    try {
      console.log('Starting closure request...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log('User authenticated:', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }
      if (!profile) throw new Error('Profile not found');
      console.log('Profile found:', profile);

      console.log('Inserting closure request...');
      const { error: requestError } = await supabase
        .from('investigation_closure_requests')
        .insert({
          citizen_id: citizen.id,
          reason: closureReason,
          requested_by: profile.id
        });

      if (requestError) {
        console.error('Request insert error:', requestError);
        throw requestError;
      }
      console.log('Closure request inserted successfully');

      // إرسال إشعار للأدمن
      console.log('Sending notification to admin...');
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          sender_id: profile.id,
          title: 'طلب إغلاق تحقيق',
          message: `طلب إغلاق تحقيق للمشتبه: ${citizen.full_name} (${citizen.national_id})\n\nالسبب: ${closureReason}\n\nمقدم الطلب: ${profile.full_name}`,
          priority: 'high',
          is_system_wide: false,
          target_departments: ['admin'],
          action_url: `/investigation-closure-management`
        });

      if (notificationError) {
        console.error('Notification error:', notificationError);
        throw notificationError;
      }
      console.log('Notification sent successfully');

      toast.success('تم إرسال طلب إغلاق التحقيق للموافقة');
      setClosureReason('');
      setActiveDialog(null);
      
      // إعادة جلب طلبات الإغلاق لتحديث العرض
      await fetchClosureRequests();
    } catch (error) {
      console.error('Error closing investigation:', error);
      toast.error('حدث خطأ أثناء إرسال طلب الإغلاق');
    }
  };

  // دوال التعامل مع التبليغات
  const fillTemplate = () => {
    if (!selectedTemplate) {
      toast.error('الرجاء اختيار قالب أولاً');
      return;
    }
    
    const template = notificationTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    let filledText = template.template
      .replace(/{fullName}/g, citizen.full_name)
      .replace(/{nationalId}/g, citizen.national_id);
    
    if (customDate) {
      const formattedDate = format(customDate, 'yyyy-MM-dd', { locale: ar });
      filledText = filledText.replace(/{date}/g, formattedDate);
    }
    
    if (customDay) {
      const dayLabel = arabicDays.find(d => d.value === customDay)?.label || customDay;
      filledText = filledText.replace(/{day}/g, dayLabel);
    }
    
    if (customTime) {
      filledText = filledText.replace(/{time}/g, customTime);
    }
    
    setNotificationText(filledText);
    toast.success('تم ملء القالب بنجاح');
  };

  const copyToClipboard = () => {
    if (!notificationText) {
      toast.error('لا يوجد نص للنسخ');
      return;
    }
    
    navigator.clipboard.writeText(notificationText);
    toast.success('تم نسخ النص للحافظة');
  };

  const clearNotification = () => {
    setNotificationText('');
    setSelectedTemplate('');
    setCustomDate(undefined);
    setCustomDay('');
    setCustomTime('');
    toast.info('تم مسح النص');
  };

  const fetchNotificationHistory = async () => {
    if (!citizen) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('official_notifications')
        .select(`
          *,
          sender:profiles!official_notifications_sender_id_fkey(full_name)
        `)
        .eq('citizen_id', citizen.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificationHistory(data || []);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      toast.error('حدث خطأ أثناء جلب سجل التبليغات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim()) {
      toast.error('الرجاء إدخال نص التبليغ');
      return;
    }
    
    if (!citizen.phone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }

    setSendingNotification(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // حفظ التبليغ في قاعدة البيانات
      const { error: saveError } = await supabase
        .from('official_notifications')
        .insert({
          citizen_id: citizen.id,
          sender_id: profile.id,
          notification_text: notificationText,
          template_used: selectedTemplate || null,
          sent_via: 'phone',
          scheduled_date: customDate ? format(customDate, 'yyyy-MM-dd') : null,
          scheduled_day: customDay || null,
          scheduled_time: customTime || null,
          status: 'sent'
        });

      if (saveError) throw saveError;

      // تسجيل في tickets
      await logTicket({
        section: 'CID - Official Notifications',
        action_type: 'create',
        description: `إرسال تبليغ رسمي إلى: ${citizen.full_name} (${citizen.national_id})`,
        metadata: {
          citizen_id: citizen.id,
          template_used: selectedTemplate,
          notification_preview: notificationText.substring(0, 100) + '...'
        }
      });

      toast.success(`تم حفظ التبليغ الرسمي`);
      
      // مسح النص وإغلاق Dialog
      clearNotification();
      setActiveDialog(null);

      // خيار فتح تطبيق الهاتف أو WhatsApp
      const shouldOpen = window.confirm(
        `هل تريد فتح تطبيق الهاتف للاتصال بـ ${citizen.phone}؟\n\nأو اضغط "إلغاء" لفتح WhatsApp`
      );
      
      if (shouldOpen) {
        window.location.href = `tel:${citizen.phone}`;
      } else {
        const encodedText = encodeURIComponent(notificationText);
        window.open(`https://wa.me/${citizen.phone.replace(/\D/g, '')}?text=${encodedText}`, '_blank');
      }
      
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('حدث خطأ أثناء حفظ التبليغ');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleActionClick = async (action: string) => {
    switch (action) {
      case 'incidents':
        await fetchIncidents();
        setActiveDialog('incidents');
        break;
      case 'forensic':
        await fetchForensicEvidence();
        setActiveDialog('forensic');
        break;
      case 'family':
        await fetchFamilyMembers();
        setActiveDialog('family');
        break;
      case 'face':
        setActiveDialog('face');
        break;
      case 'notes':
        await fetchPreviousNotes();
        setActiveDialog('notes');
        break;
      case 'files':
        setActiveDialog('files');
        break;
      case 'notification':
        setActiveDialog('notification');
        break;
      case 'history':
        await fetchNotificationHistory();
        setShowHistory(true);
        break;
      case 'close':
        await fetchClosureRequests();
        setActiveDialog('close');
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
            <BackButton to="/department/cid/suspect-search" />
            
            <h1 className="text-xl md:text-2xl font-bold text-red-600 flex-1 text-center">
              المشتبه: {citizen.full_name}
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
              className="text-red-600 hover:text-red-600"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6 shadow-lg border-red-200">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رقم الهوية</span>
                <span className="font-semibold text-red-600 text-lg">{citizen.national_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الاسم الكامل</span>
                <span className="font-semibold">{citizen.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الحالة</span>
                <Badge variant="destructive">قيد التحقيق</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رقم الهاتف</span>
                <span className="font-semibold">{citizen.phone || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">آخر تحديث</span>
                <span className="font-semibold">
                  {new Date(citizen.updated_at).toLocaleDateString('ar')}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-red-600">
            🕵️ Criminal Investigation Overview
          </h2>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('incidents')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FileText className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">البلاغات المرتبطة</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('forensic')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <TestTube className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">الأدلة الجنائية</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('family')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Users className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">الأشخاص المرتبطون</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('face')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <ScanFace className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">التعرف على الوجه</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('notes')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FileEdit className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">ملاحظات التحقيق</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('files')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FolderOpen className="h-12 w-12 mb-4 text-orange-500" />
              <p className="text-sm md:text-base font-semibold text-center">ملفات القضية</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('notification')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Megaphone className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">إرسال تبليغ</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('history')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <History className="h-12 w-12 mb-4 text-indigo-500" />
              <p className="text-sm md:text-base font-semibold text-center">سجل التبليغات</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-500"
            onClick={() => handleActionClick('close')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <XCircle className="h-12 w-12 mb-4 text-red-500" />
              <p className="text-sm md:text-base font-semibold text-center">إغلاق التحقيق</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Incidents Dialog */}
      <Dialog open={activeDialog === 'incidents'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              البلاغات المرتبطة
            </DialogTitle>
            <DialogDescription>
              البلاغات والحوادث المسجلة في النظام
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{incident.title}</h3>
                          <p className="text-sm text-muted-foreground">{incident.incident_type}</p>
                        </div>
                        <Badge variant={
                          incident.status === 'resolved' ? 'default' : 
                          incident.status === 'in_progress' ? 'secondary' : 
                          'destructive'
                        }>
                          {incident.status === 'resolved' ? 'محلول' : 
                           incident.status === 'in_progress' ? 'قيد المعالجة' : 
                           'جديد'}
                        </Badge>
                      </div>
                      <p className="text-sm">{incident.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>📅 {new Date(incident.created_at).toLocaleDateString('ar')}</span>
                        {incident.location_address && (
                          <span>📍 {incident.location_address}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بلاغات مسجلة
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Forensic Evidence Dialog */}
      <Dialog open={activeDialog === 'forensic'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6" />
              الأدلة الجنائية
            </DialogTitle>
            <DialogDescription>
              الأدلة الجنائية المسجلة في النظام
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : forensicEvidence.length > 0 ? (
            <div className="space-y-4">
              {forensicEvidence.map((evidence) => (
                <Card key={evidence.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">نوع الدليل</p>
                        <p className="font-semibold">{evidence.evidence_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">حالة التحقق</p>
                        <Badge variant={evidence.is_verified ? 'default' : 'secondary'}>
                          {evidence.is_verified ? 'تم التحقق' : 'قيد الفحص'}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">الوصف</p>
                        <p className="text-sm">{evidence.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ الجمع</p>
                        <p className="text-sm">
                          {new Date(evidence.collection_date).toLocaleDateString('ar')}
                        </p>
                      </div>
                      {evidence.analysis_date && (
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ التحليل</p>
                          <p className="text-sm">
                            {new Date(evidence.analysis_date).toLocaleDateString('ar')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أدلة جنائية مسجلة
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Family Members Dialog */}
      <Dialog open={activeDialog === 'family'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              الأشخاص المرتبطون
            </DialogTitle>
            <DialogDescription>
              أفراد العائلة والأشخاص ذوي الصلة
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : familyMembers.length > 0 ? (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">الاسم</p>
                        <p className="font-semibold">{member.relative_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">القرابة</p>
                        <Badge>{member.relation}</Badge>
                      </div>
                      {member.relative_national_id && (
                        <div>
                          <p className="text-sm text-muted-foreground">رقم الهوية</p>
                          <p className="text-sm">{member.relative_national_id}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد أشخاص مرتبطون مسجلين
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={activeDialog === 'notes'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-6 w-6" />
              ملاحظات التحقيق
            </DialogTitle>
            <DialogDescription>
              إضافة ومشاهدة ملاحظات التحقيق
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* إضافة ملاحظة جديدة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إضافة ملاحظة جديدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="اكتب ملاحظاتك هنا..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <Button 
                  className="w-full"
                  onClick={handleSaveNote}
                >
                  حفظ الملاحظة
                </Button>
              </CardContent>
            </Card>

            {/* الملاحظات السابقة */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">الملاحظات السابقة</h3>
              {loadingData ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : previousNotes.length > 0 ? (
                <div className="space-y-3">
                  {previousNotes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-primary">
                              {note.creator?.full_name || 'محقق'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.created_at).toLocaleDateString('ar', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{note.note_text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد ملاحظات سابقة
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Files Dialog */}
      <Dialog open={activeDialog === 'files'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              ملفات القضية
            </DialogTitle>
            <DialogDescription>
              الملفات والمستندات المرتبطة بالقضية
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">لا توجد ملفات مرفقة حالياً</p>
            <Button variant="outline">
              <FolderOpen className="h-4 w-4 ml-2" />
              إضافة ملفات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={activeDialog === 'notification'} onOpenChange={() => {
        setActiveDialog(null);
        clearNotification();
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-6 w-6" />
              إرسال تبليغ رسمي
            </DialogTitle>
            <DialogDescription>
              اختر قالباً جاهزاً أو اكتب تبليغاً مخصصاً
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* معلومات المستلم */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">المستلم:</span>
                    <span className="font-bold text-lg">{citizen.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">رقم الهوية:</span>
                    <span className="font-semibold">{citizen.national_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">رقم الهاتف:</span>
                    <span className={`font-semibold ${citizen.phone ? 'text-green-600' : 'text-red-600'}`}>
                      {citizen.phone || 'غير متوفر'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* اختيار القالب */}
            <div className="space-y-2">
              <Label htmlFor="template-select">اختر قالب جاهز</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="-- اختر قالباً --" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* الخيارات الإضافية للتخصيص */}
            {selectedTemplate && (
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/50">
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    خيارات إضافية (اختياري)
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* التاريخ */}
                    <div className="space-y-2">
                      <Label>التاريخ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right font-normal"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {customDate ? format(customDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customDate}
                            onSelect={setCustomDate}
                            locale={ar}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* اليوم */}
                    <div className="space-y-2">
                      <Label htmlFor="day-select">اليوم</Label>
                      <Select value={customDay} onValueChange={setCustomDay}>
                        <SelectTrigger id="day-select">
                          <SelectValue placeholder="اختر اليوم" />
                        </SelectTrigger>
                        <SelectContent>
                          {arabicDays.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* الوقت */}
                    <div className="space-y-2">
                      <Label htmlFor="time-input">الوقت</Label>
                      <Input
                        id="time-input"
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        placeholder="00:00"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={fillTemplate}
                    variant="default"
                    className="w-full"
                    size="sm"
                  >
                    <Send className="h-4 w-4 ml-2" />
                    ملء القالب بالبيانات
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* نص التبليغ */}
            <div className="space-y-2">
              <Label htmlFor="notification-text">نص التبليغ الرسمي</Label>
              <Textarea
                id="notification-text"
                placeholder="اختر قالباً جاهزاً أو اكتب نصاً مخصصاً..."
                rows={10}
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                className="font-arabic text-base"
              />
              <p className="text-xs text-muted-foreground">
                يمكنك تعديل النص بعد ملء القالب
              </p>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1"
                disabled={!notificationText}
              >
                <Copy className="h-4 w-4 ml-2" />
                نسخ النص
              </Button>
              
              <Button
                onClick={clearNotification}
                variant="outline"
                className="flex-1"
                disabled={!notificationText && !selectedTemplate}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                مسح الكل
              </Button>
            </div>

            {/* زر الإرسال */}
            <Button 
              className="w-full"
              onClick={handleSendNotification}
              disabled={!notificationText.trim() || !citizen.phone || sendingNotification}
            >
              <Send className="h-4 w-4 ml-2" />
              {sendingNotification ? 'جارٍ الحفظ...' : 'حفظ وإرسال التبليغ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Face Recognition Dialog */}
      <Dialog open={activeDialog === 'face'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanFace className="h-6 w-6" />
              التعرف على الوجه
            </DialogTitle>
            <DialogDescription>
              التعرف على وجه المشتبه باستخدام الكاميرا أو رفع صورة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* زر إعادة توليد Embedding */}
            {citizen.photo_url && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm mb-1">تحديث بيانات التعرف</p>
                      <p className="text-xs text-muted-foreground">
                        إذا كان التعرف لا يعمل بشكل صحيح، قم بتحديث بيانات التعرف أولاً
                      </p>
                    </div>
                    <Button
                      onClick={regenerateFaceEmbedding}
                      disabled={regeneratingEmbedding}
                      variant="outline"
                      size="sm"
                    >
                      {regeneratingEmbedding ? 'جارٍ التحديث...' : 'تحديث البيانات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {citizen.photo_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">صورة المشتبه</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={citizen.photo_url} 
                    alt={citizen.full_name}
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التعرف باستخدام الكاميرا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                  <ScanFace className="h-16 w-16 mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground mb-4">قم بتوجيه الكاميرا للتعرف على الوجه</p>
                  <Button onClick={() => toast.info('قريباً: التعرف عبر الكاميرا')}>
                    <ScanFace className="h-4 w-4 ml-2" />
                    فتح الكاميرا
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">أو</p>
                  <Button variant="outline" onClick={() => document.getElementById('face-upload')?.click()}>
                    رفع صورة للتعرف
                  </Button>
                  <input 
                    id="face-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setFaceRecognitionImage(e.target?.result as string);
                          toast.success('تم رفع الصورة');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {faceRecognitionImage && (
                  <div className="mt-4">
                    <img 
                      src={faceRecognitionImage} 
                      alt="Face Recognition"
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                    <div className="flex gap-2 mt-4">
                      <Button 
                        className="flex-1" 
                        onClick={async () => {
                          setRecognitionLoading(true);
                          setFaceRecognitionResults([]);
                          try {
                            const result = await searchFaces(faceRecognitionImage);
                            if (result.success && result.matches && result.matches.length > 0) {
                              setFaceRecognitionResults(result.matches);
                              toast.success(`تم العثور على ${result.matches.length} تطابق`);
                            } else {
                              toast.error('لم يتم العثور على أي تطابق');
                            }
                          } catch (error) {
                            console.error('Face recognition error:', error);
                            toast.error('حدث خطأ أثناء التعرف على الوجه');
                          } finally {
                            setRecognitionLoading(false);
                          }
                        }}
                        disabled={recognitionLoading}
                      >
                        {recognitionLoading ? 'جارٍ التعرف...' : 'التعرف الآن'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setFaceRecognitionImage(null);
                          setFaceRecognitionResults([]);
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}

                {/* عرض نتائج التعرف على الوجه */}
                {faceRecognitionResults.length > 0 && (
                  <Card className="mt-4 border-green-200 bg-green-50 dark:bg-green-950">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700 dark:text-green-300">
                        نتائج التعرف ({faceRecognitionResults.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {faceRecognitionResults.map((match, index) => (
                        <Card key={index} className="bg-white dark:bg-gray-800">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">الاسم</p>
                                <p className="font-semibold">{match.name || match.full_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">نسبة التطابق</p>
                                <Badge variant={match.similarity > 0.8 ? 'default' : 'secondary'}>
                                  {(match.similarity * 100).toFixed(2)}%
                                </Badge>
                              </div>
                              {match.nationalId && (
                                <div>
                                  <p className="text-sm text-muted-foreground">رقم الهوية</p>
                                  <p className="text-sm">{match.nationalId}</p>
                                </div>
                              )}
                              {match.role && (
                                <div>
                                  <p className="text-sm text-muted-foreground">الوظيفة</p>
                                  <p className="text-sm">{match.role}</p>
                                </div>
                              )}
                              {match.photo_url && (
                                <div className="col-span-2">
                                  <p className="text-sm text-muted-foreground mb-2">الصورة</p>
                                  <img 
                                    src={match.photo_url} 
                                    alt={match.name || match.full_name}
                                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Investigation Dialog */}
      <Dialog open={activeDialog === 'close'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              إغلاق التحقيق وسجلات الإغلاق
            </DialogTitle>
            <DialogDescription>
              طلب إغلاق التحقيق ومشاهدة السجلات السابقة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* طلب إغلاق جديد */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">طلب إغلاق تحقيق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ تحذير: إغلاق التحقيق يتطلب موافقة المدير ولا يمكن التراجع عنه
                  </p>
                </div>
                <Textarea
                  placeholder="سبب إغلاق التحقيق..."
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setActiveDialog(null)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleCloseInvestigation}
                  >
                    إرسال طلب الإغلاق
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* سجلات الإغلاق السابقة */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">سجلات طلبات الإغلاق</h3>
              {loadingData ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : closureRequests.length > 0 ? (
                <div className="space-y-3">
                  {closureRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                طلب من: {request.requester?.full_name || 'محقق'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(request.requested_at).toLocaleDateString('ar', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {request.status === 'approved' ? 'تمت الموافقة' :
                               request.status === 'rejected' ? 'مرفوض' :
                               'قيد المراجعة'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">السبب:</p>
                            <p className="text-sm">{request.reason}</p>
                          </div>
                          {request.reviewed_by && (
                            <div className="border-t pt-2">
                              <p className="text-xs font-semibold text-muted-foreground">
                                تمت المراجعة من: {request.reviewer?.full_name || 'المدير'}
                              </p>
                              {request.admin_notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ملاحظات المدير: {request.admin_notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                بتاريخ: {new Date(request.reviewed_at).toLocaleDateString('ar')}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات إغلاق سابقة
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              سجل التبليغات الرسمية
            </DialogTitle>
            <DialogDescription>
              جميع التبليغات المرسلة لـ {citizen.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : notificationHistory.length > 0 ? (
            <div className="space-y-4">
              {notificationHistory.map((notification, index) => (
                <Card key={notification.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          {notification.template_used && (
                            <Badge variant="secondary" className="text-xs">
                              {notificationTemplates.find(t => t.id === notification.template_used)?.title || 'قالب مخصص'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                          </span>
                          <span>
                            {new Date(notification.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        notification.status === 'sent' ? 'default' :
                        notification.status === 'delivered' ? 'secondary' :
                        notification.status === 'read' ? 'outline' : 'destructive'
                      }>
                        {notification.status === 'sent' ? 'تم الإرسال' :
                         notification.status === 'delivered' ? 'تم التسليم' :
                         notification.status === 'read' ? 'تمت القراءة' : 'فشل'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">المرسل</p>
                        <p className="font-semibold">{notification.sender?.full_name || 'غير معروف'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">طريقة الإرسال</p>
                        <p className="font-semibold">
                          {notification.sent_via === 'phone' ? '📞 هاتف' :
                           notification.sent_via === 'sms' ? '💬 SMS' :
                           notification.sent_via === 'whatsapp' ? '📱 WhatsApp' :
                           notification.sent_via === 'email' ? '📧 بريد' : notification.sent_via}
                        </p>
                      </div>
                      {notification.scheduled_date && (
                        <div>
                          <p className="text-muted-foreground text-xs">التاريخ المحدد</p>
                          <p className="font-semibold">{notification.scheduled_date}</p>
                        </div>
                      )}
                      {notification.scheduled_time && (
                        <div>
                          <p className="text-muted-foreground text-xs">الوقت المحدد</p>
                          <p className="font-semibold">{notification.scheduled_time}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">نص التبليغ:</p>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm whitespace-pre-wrap font-arabic leading-relaxed">
                          {notification.notification_text}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(notification.notification_text);
                          toast.success('تم نسخ النص');
                        }}
                      >
                        <Copy className="h-3 w-3 ml-1" />
                        نسخ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNotificationText(notification.notification_text);
                          setSelectedTemplate(notification.template_used || '');
                          setShowHistory(false);
                          setActiveDialog('notification');
                          toast.info('تم استرجاع النص');
                        }}
                      >
                        <Send className="h-3 w-3 ml-1" />
                        إعادة إرسال
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold">لا توجد تبليغات سابقة</p>
              <p className="text-sm mt-2">لم يتم إرسال أي تبليغ رسمي لهذا المشتبه حتى الآن</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CIDSuspectRecord;
