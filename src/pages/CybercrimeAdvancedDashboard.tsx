import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Eye, 
  Search, 
  BarChart3, 
  Users, 
  Clock,
  Plus,
  Download,
  Archive,
  BookOpen,
  Video,
  Image as ImageIcon,
  Lock,
  TrendingUp
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface CybercrimeCase {
  id: string;
  case_number: string;
  case_type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  reporter_id: string;
  assigned_officer_id?: string;
  evidence_files: string[];
  created_at: string;
  updated_at: string;
}

interface Evidence {
  id: string;
  case_id: string;
  evidence_type: string;
  file_url?: string;
  description: string;
  collected_by: string;
  collected_at: string;
}

export default function CybercrimeAdvancedDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cases, setCases] = useState<CybercrimeCase[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CybercrimeCase | null>(null);
  
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    case_type: 'fraud',
    priority: 'medium'
  });
  
  const [evidenceForm, setEvidenceForm] = useState({
    case_id: '',
    evidence_type: 'digital_file',
    description: '',
    file_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesRes, evidenceRes] = await Promise.all([
        supabase.from('cybercrime_cases').select('*').order('created_at', { ascending: false }),
        supabase.from('cybercrime_evidence').select('*').order('collected_at', { ascending: false })
      ]);

      if (casesRes.error) throw casesRes.error;
      if (evidenceRes.error) throw evidenceRes.error;

      setCases(casesRes.data || []);
      setEvidence(evidenceRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCase = async () => {
    try {
      if (!user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const caseNumber = `CYBER-${Date.now()}`;
      
      const { error } = await supabase
        .from('cybercrime_cases')
        .insert([{
          ...caseForm,
          case_number: caseNumber,
          reporter_id: profile.id,
          evidence_files: []
        }]);

      if (error) throw error;

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء القضية بنجاح",
      });

      setShowCaseDialog(false);
      setCaseForm({
        title: '',
        description: '',
        case_type: 'fraud',
        priority: 'medium'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء القضية",
        variant: "destructive",
      });
    }
  };

  const createEvidence = async () => {
    try {
      if (!user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('cybercrime_evidence')
        .insert([{
          ...evidenceForm,
          collected_by: profile.id
        }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الدليل بنجاح",
      });

      setShowEvidenceDialog(false);
      setEvidenceForm({
        case_id: '',
        evidence_type: 'digital_file',
        description: '',
        file_url: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating evidence:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الدليل",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCaseTypeText = (type: string) => {
    const types: Record<string, string> = {
      fraud: 'احتيال إلكتروني',
      hacking: 'اختراق',
      malware: 'برامج ضارة',
      phishing: 'تصيد إلكتروني',
      identity_theft: 'سرقة هوية',
      cyberbullying: 'تنمر إلكتروني',
      data_breach: 'تسرب بيانات',
      other: 'أخرى'
    };
    return types[type] || type;
  };

  const getEvidenceTypeText = (type: string) => {
    const types: Record<string, string> = {
      digital_file: 'ملف رقمي',
      screenshot: 'لقطة شاشة',
      log_file: 'ملف سجل',
      network_trace: 'تتبع الشبكة',
      email: 'بريد إلكتروني',
      social_media: 'وسائل التواصل',
      financial_record: 'سجل مالي',
      other: 'أخرى'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 md:gap-3">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              مركز الجرائم الإلكترونية المتقدم
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              إدارة شاملة للجرائم الإلكترونية والتحقيقات الرقمية
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-red-600">القضايا المفتوحة</p>
                <p className="text-xl md:text-2xl font-bold text-red-700 mt-1">
                  {cases.filter(c => c.status === 'open').length}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-amber-600">قيد التحقيق</p>
                <p className="text-xl md:text-2xl font-bold text-amber-700 mt-1">
                  {cases.filter(c => c.status === 'investigating').length}
                </p>
              </div>
              <Search className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-green-600">القضايا المحلولة</p>
                <p className="text-xl md:text-2xl font-bold text-green-700 mt-1">
                  {cases.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-blue-600">إجمالي الأدلة</p>
                <p className="text-xl md:text-2xl font-bold text-blue-700 mt-1">{evidence.length}</p>
              </div>
              <Archive className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="reports" className="flex-shrink-0">التقارير</TabsTrigger>
            <TabsTrigger value="analysis" className="flex-shrink-0">التحليل</TabsTrigger>
            <TabsTrigger value="evidence" className="flex-shrink-0">الأدلة</TabsTrigger>
            <TabsTrigger value="alerts" className="flex-shrink-0">التحذيرات</TabsTrigger>
            <TabsTrigger value="education" className="flex-shrink-0">التوعية</TabsTrigger>
            <TabsTrigger value="investigations" className="flex-shrink-0">التحقيقات</TabsTrigger>
            <TabsTrigger value="risk" className="flex-shrink-0">المخاطر</TabsTrigger>
            <TabsTrigger value="statistics" className="flex-shrink-0">الإحصائيات</TabsTrigger>
          </TabsList>
        </div>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  التقارير والشكاوى ({cases.length})
                </CardTitle>
                <Button onClick={() => setShowCaseDialog(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  تقرير جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {cases.map((case_) => (
                  <div key={case_.id} className="border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm md:text-base">{case_.title}</h4>
                          <Badge className={getPriorityColor(case_.priority) + " text-xs"}>
                            {case_.priority === 'high' ? 'عالي' : case_.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                          <Badge className={getStatusColor(case_.status) + " text-xs"}>
                            {case_.status === 'open' ? 'مفتوح' : 
                             case_.status === 'investigating' ? 'قيد التحقيق' :
                             case_.status === 'resolved' ? 'محلول' : 'مغلق'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm">
                          <div>
                            <Label className="text-muted-foreground text-xs">رقم القضية</Label>
                            <p className="font-mono text-xs md:text-sm">{case_.case_number}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">نوع الجريمة</Label>
                            <p className="text-xs md:text-sm">{getCaseTypeText(case_.case_type)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">تاريخ الإبلاغ</Label>
                            <p className="text-xs md:text-sm">{new Date(case_.created_at).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-xs md:text-sm mt-2 line-clamp-2">{case_.description}</p>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="mr-1 hidden sm:inline">عرض</span>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="mr-1 hidden sm:inline">تحميل</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                الحوادث والتحليلات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid gap-4 md:gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-3 md:p-4">
                    <h4 className="font-semibold mb-3 text-sm md:text-base">أنواع الجرائم الأكثر شيوعاً</h4>
                    <div className="space-y-2">
                      {['fraud', 'hacking', 'phishing'].map(type => {
                        const count = cases.filter(c => c.case_type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-xs md:text-sm">{getCaseTypeText(type)}</span>
                            <Badge variant="outline" className="text-xs">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  
                  <Card className="p-3 md:p-4">
                    <h4 className="font-semibold mb-3 text-sm md:text-base">اتجاهات الجرائم الشهرية</h4>
                    <div className="flex flex-col items-center justify-center h-20">
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs md:text-sm mt-2">الرسم البياني</span>
                    </div>
                  </Card>
                </div>
                
                <Card className="p-3 md:p-4">
                  <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">تحليل سريع للحوادث</h4>
                  <div className="space-y-3">
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                      <p className="text-red-700 text-xs md:text-sm">
                        <strong>تنبيه:</strong> زيادة في حوادث التصيد الإلكتروني بنسبة 25% هذا الأسبوع
                      </p>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                      <p className="text-amber-700 text-xs md:text-sm">
                        <strong>ملاحظة:</strong> نمط جديد في عمليات الاحتيال المصرفي الإلكتروني
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Archive className="h-4 w-4 md:h-5 md:w-5" />
                  إدارة الأدلة الرقمية ({evidence.length})
                </CardTitle>
                <Button onClick={() => setShowEvidenceDialog(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" size="sm">
                  <Upload className="h-4 w-4 ml-2" />
                  رفع دليل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {evidence.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 md:p-4">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">{getEvidenceTypeText(item.evidence_type)}</Badge>
                          {item.file_url && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <FileText className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="text-xs md:text-sm">ملف مرفق</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs md:text-sm line-clamp-2">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          تم جمعه في: {new Date(item.collected_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        {item.file_url && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="mr-1 hidden sm:inline">تحميل</span>
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="mr-1 hidden sm:inline">عرض</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                التحذيرات والتنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                    <h4 className="font-semibold text-red-700 text-sm md:text-base">تحذير أمني عالي</h4>
                  </div>
                  <p className="text-red-700 text-xs md:text-sm">
                    تم اكتشاف برنامج فدية جديد يستهدف المؤسسات الحكومية. يرجى تحديث أنظمة الحماية فوراً.
                  </p>
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 md:p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                    <h4 className="font-semibold text-amber-700 text-sm md:text-base">تنبيه متوسط</h4>
                  </div>
                  <p className="text-amber-700 text-xs md:text-sm">
                    زيادة في نشاط التصيد الإلكتروني عبر رسائل SMS. تأكد من توعية الموظفين.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                التوعية والتعليم
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid gap-4 md:gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-3 md:p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                      <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      <h4 className="font-semibold text-sm md:text-base">مقالات الحماية</h4>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      دليل شامل لحماية البيانات الشخصية والمؤسسية من الجرائم الإلكترونية
                    </p>
                  </Card>
                  
                  <Card className="p-3 md:p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                      <Video className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                      <h4 className="font-semibold text-sm md:text-base">فيديوهات تعليمية</h4>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      مجموعة من الفيديوهات التعليمية حول التعرف على التهديدات الإلكترونية
                    </p>
                  </Card>
                </div>
                
                <Card className="p-3 md:p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
                    <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                    إنفوجرافيك التوعية
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3 text-center">
                      <div className="w-full h-24 md:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-2 flex items-center justify-center">
                        <Lock className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <p className="text-xs md:text-sm font-medium">كلمات المرور الآمنة</p>
                    </div>
                    
                    <div className="border rounded-lg p-3 text-center">
                      <div className="w-full h-24 md:h-32 bg-gradient-to-br from-green-100 to-green-200 rounded mb-2 flex items-center justify-center">
                        <Shield className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                      </div>
                      <p className="text-xs md:text-sm font-medium">التصفح الآمن</p>
                    </div>
                    
                    <div className="border rounded-lg p-3 text-center">
                      <div className="w-full h-24 md:h-32 bg-gradient-to-br from-red-100 to-red-200 rounded mb-2 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                      </div>
                      <p className="text-xs md:text-sm font-medium">التعرف على الاحتيال</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would follow similar patterns */}
        <TabsContent value="investigations" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
                التحقيقات ومتابعة الجرائم
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <p className="text-muted-foreground text-sm">متابعة حالة التحقيق وربطه بالجهات المعنية - قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                تقييم المخاطر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <p className="text-muted-foreground text-sm">أدوات لتقييم المخاطر الرقمية - قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                التقارير الإحصائية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <p className="text-muted-foreground text-sm">عرض الرسوم البيانية والمخططات الخاصة بالجرائم - قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Case Dialog */}
      <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">إنشاء تقرير جريمة إلكترونية</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              املأ البيانات التالية للإبلاغ عن جريمة إلكترونية
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm">عنوان القضية *</Label>
              <Input
                id="title"
                value={caseForm.title}
                onChange={(e) => setCaseForm({...caseForm, title: e.target.value})}
                placeholder="وصف مختصر للجريمة"
                className="text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm">نوع الجريمة</Label>
                <Select
                  value={caseForm.case_type}
                  onValueChange={(value) => setCaseForm({...caseForm, case_type: value})}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="fraud">احتيال إلكتروني</SelectItem>
                    <SelectItem value="hacking">اختراق</SelectItem>
                    <SelectItem value="malware">برامج ضارة</SelectItem>
                    <SelectItem value="phishing">تصيد إلكتروني</SelectItem>
                    <SelectItem value="identity_theft">سرقة هوية</SelectItem>
                    <SelectItem value="cyberbullying">تنمر إلكتروني</SelectItem>
                    <SelectItem value="data_breach">تسرب بيانات</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-sm">الأولوية</Label>
                <Select
                  value={caseForm.priority}
                  onValueChange={(value) => setCaseForm({...caseForm, priority: value})}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm">وصف تفصيلي *</Label>
              <Textarea
                id="description"
                value={caseForm.description}
                onChange={(e) => setCaseForm({...caseForm, description: e.target.value})}
                placeholder="اكتب وصفاً تفصيلياً للجريمة والأضرار والأدلة المتاحة"
                rows={6}
                className="text-sm resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={createCase}
              disabled={!caseForm.title || !caseForm.description}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              size="sm"
            >
              إرسال التقرير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">إضافة دليل رقمي</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              أضف دليلاً رقمياً لقضية موجودة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm">القضية</Label>
              <Select
                value={evidenceForm.case_id}
                onValueChange={(value) => setEvidenceForm({...evidenceForm, case_id: value})}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر القضية" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {cases.map(case_ => (
                    <SelectItem key={case_.id} value={case_.id} className="text-sm">
                      {case_.case_number} - {case_.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-sm">نوع الدليل</Label>
              <Select
                value={evidenceForm.evidence_type}
                onValueChange={(value) => setEvidenceForm({...evidenceForm, evidence_type: value})}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="digital_file">ملف رقمي</SelectItem>
                  <SelectItem value="screenshot">لقطة شاشة</SelectItem>
                  <SelectItem value="log_file">ملف سجل</SelectItem>
                  <SelectItem value="network_trace">تتبع الشبكة</SelectItem>
                  <SelectItem value="email">بريد إلكتروني</SelectItem>
                  <SelectItem value="social_media">وسائل التواصل</SelectItem>
                  <SelectItem value="financial_record">سجل مالي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm">وصف الدليل</Label>
              <Textarea
                id="description"
                value={evidenceForm.description}
                onChange={(e) => setEvidenceForm({...evidenceForm, description: e.target.value})}
                placeholder="وصف تفصيلي للدليل ومصدره وأهميته"
                rows={4}
                className="text-sm resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file_url" className="text-sm">رابط الملف (اختياري)</Label>
              <Input
                id="file_url"
                value={evidenceForm.file_url}
                onChange={(e) => setEvidenceForm({...evidenceForm, file_url: e.target.value})}
                placeholder="https://example.com/evidence.pdf"
                className="text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={createEvidence}
              disabled={!evidenceForm.case_id || !evidenceForm.description}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              size="sm"
            >
              حفظ الدليل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
