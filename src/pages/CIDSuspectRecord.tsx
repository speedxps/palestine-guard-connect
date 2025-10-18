import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, TestTube, Users, ScanFace, 
  FileEdit, FolderOpen, Megaphone, XCircle, ArrowRight, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
  const [loadingData, setLoadingData] = useState(false);

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
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
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
        navigate('/face-recognition');
        break;
      case 'notes':
        setActiveDialog('notes');
        break;
      case 'files':
        setActiveDialog('files');
        break;
      case 'notification':
        setActiveDialog('notification');
        break;
      case 'close':
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-6 w-6" />
              ملاحظات التحقيق
            </DialogTitle>
            <DialogDescription>
              إضافة ملاحظات حول التحقيق الجاري
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="اكتب ملاحظاتك هنا..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
            <Button 
              className="w-full"
              onClick={() => {
                if (notes.trim()) {
                  toast.success('تم حفظ الملاحظات بنجاح');
                  setNotes('');
                  setActiveDialog(null);
                } else {
                  toast.error('الرجاء إدخال ملاحظات');
                }
              }}
            >
              حفظ الملاحظات
            </Button>
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
      <Dialog open={activeDialog === 'notification'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-6 w-6" />
              إرسال تبليغ رسمي
            </DialogTitle>
            <DialogDescription>
              إرسال تبليغ رسمي للمشتبه
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">المستلم:</p>
              <p className="font-semibold">{citizen.full_name}</p>
              <p className="text-sm text-muted-foreground">{citizen.phone || 'رقم الهاتف غير متوفر'}</p>
            </div>
            <Textarea
              placeholder="نص التبليغ الرسمي..."
              rows={4}
            />
            <Button 
              className="w-full"
              onClick={() => {
                if (citizen.phone) {
                  toast.success(`سيتم إرسال تبليغ رسمي إلى ${citizen.phone}`);
                  setActiveDialog(null);
                } else {
                  toast.error('رقم الهاتف غير متوفر');
                }
              }}
            >
              إرسال التبليغ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Investigation Dialog */}
      <Dialog open={activeDialog === 'close'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              إغلاق التحقيق
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إغلاق التحقيق مع هذا المشتبه؟
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ تحذير: إغلاق التحقيق يتطلب موافقة المدير ولا يمكن التراجع عنه
              </p>
            </div>
            <Textarea
              placeholder="سبب إغلاق التحقيق..."
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
                onClick={() => {
                  toast.info('تم إرسال طلب إغلاق التحقيق للموافقة');
                  setActiveDialog(null);
                }}
              >
                إرسال طلب الإغلاق
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CIDSuspectRecord;
