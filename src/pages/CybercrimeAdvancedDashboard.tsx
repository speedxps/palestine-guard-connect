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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              مركز الجرائم الإلكترونية المتقدم
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة شاملة للجرائم الإلكترونية والتحقيقات الرقمية
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">القضايا المفتوحة</p>
                <p className="text-2xl font-bold text-red-700">
                  {cases.filter(c => c.status === 'open').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">قيد التحقيق</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {cases.filter(c => c.status === 'investigating').length}
                </p>
              </div>
              <Search className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">القضايا المحلولة</p>
                <p className="text-2xl font-bold text-green-700">
                  {cases.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">إجمالي الأدلة</p>
                <p className="text-2xl font-bold text-blue-700">{evidence.length}</p>
              </div>
              <Archive className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
          <TabsTrigger value="evidence">الأدلة</TabsTrigger>
          <TabsTrigger value="alerts">التحذيرات</TabsTrigger>
          <TabsTrigger value="education">التوعية</TabsTrigger>
          <TabsTrigger value="investigations">التحقيقات</TabsTrigger>
          <TabsTrigger value="risk">تقييم المخاطر</TabsTrigger>
          <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  التقارير والشكاوى ({cases.length})
                </CardTitle>
                <Button onClick={() => setShowCaseDialog(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 ml-2" />
                  تقرير جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.map((case_) => (
                  <div key={case_.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{case_.title}</h4>
                          <Badge className={getPriorityColor(case_.priority)}>
                            {case_.priority === 'high' ? 'عالي' : case_.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status === 'open' ? 'مفتوح' : 
                             case_.status === 'investigating' ? 'قيد التحقيق' :
                             case_.status === 'resolved' ? 'محلول' : 'مغلق'}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">رقم القضية</Label>
                            <p className="font-mono">{case_.case_number}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">نوع الجريمة</Label>
                            <p>{getCaseTypeText(case_.case_type)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">تاريخ الإبلاغ</Label>
                            <p>{new Date(case_.created_at).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mt-2">{case_.description}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
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
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                الحوادث والتحليلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">أنواع الجرائم الأكثر شيوعاً</h4>
                    <div className="space-y-2">
                      {['fraud', 'hacking', 'phishing'].map(type => {
                        const count = cases.filter(c => c.case_type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm">{getCaseTypeText(type)}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">اتجاهات الجرائم الشهرية</h4>
                    <div className="flex items-center justify-center h-20">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                      <span className="text-muted-foreground ml-2">الرسم البياني</span>
                    </div>
                  </Card>
                </div>
                
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">تحليل سريع للحوادث</h4>
                  <div className="space-y-3">
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                      <p className="text-red-700 text-sm">
                        <strong>تنبيه:</strong> زيادة في حوادث التصيد الإلكتروني بنسبة 25% هذا الأسبوع
                      </p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="text-yellow-700 text-sm">
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
        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  إدارة الأدلة الرقمية ({evidence.length})
                </CardTitle>
                <Button onClick={() => setShowEvidenceDialog(true)} className="bg-primary hover:bg-primary/90">
                  <Upload className="h-4 w-4 ml-2" />
                  رفع دليل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{getEvidenceTypeText(item.evidence_type)}</Badge>
                          {item.file_url && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">ملف مرفق</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          تم جمعه في: {new Date(item.collected_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {item.file_url && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
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
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                التحذيرات والتنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h4 className="font-semibold text-red-700">تحذير أمني عالي</h4>
                  </div>
                  <p className="text-red-700 text-sm">
                    تم اكتشاف برنامج فدية جديد يستهدف المؤسسات الحكومية. يرجى تحديث أنظمة الحماية فوراً.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-semibold text-yellow-700">تنبيه متوسط</h4>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    زيادة في نشاط التصيد الإلكتروني عبر رسائل SMS. تأكد من توعية الموظفين.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                التوعية والتعليم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <h4 className="font-semibold">مقالات الحماية</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      دليل شامل لحماية البيانات الشخصية والمؤسسية من الجرائم الإلكترونية
                    </p>
                  </Card>
                  
                  <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <Video className="h-8 w-8 text-green-600" />
                      <h4 className="font-semibold">فيديوهات تعليمية</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      مجموعة من الفيديوهات التعليمية حول التعرف على التهديدات الإلكترونية
                    </p>
                  </Card>
                </div>
                
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    إنفوجرافيك التوعية
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3 text-center">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-2 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">كلمات المرور الآمنة</p>
                    </div>
                    
                    <div className="border rounded-lg p-3 text-center">
                      <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded mb-2 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">التصفح الآمن</p>
                    </div>
                    
                    <div className="border rounded-lg p-3 text-center">
                      <div className="w-full h-32 bg-gradient-to-br from-red-100 to-red-200 rounded mb-2 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="text-sm font-medium">التعرف على الاحتيال</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would follow similar patterns */}
        <TabsContent value="investigations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                التحقيقات ومتابعة الجرائم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">متابعة حالة التحقيق وربطه بالجهات المعنية - قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                تقييم المخاطر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">أدوات لتقييم المخاطر الرقمية - قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                التقارير الإحصائية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">عرض الرسوم البيانية والمخططات الخاصة بالجرائم - قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Case Dialog */}
      <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء تقرير جريمة إلكترونية</DialogTitle>
            <DialogDescription>
              املأ البيانات التالية للإبلاغ عن جريمة إلكترونية
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">عنوان القضية *</Label>
              <Input
                id="title"
                value={caseForm.title}
                onChange={(e) => setCaseForm({...caseForm, title: e.target.value})}
                placeholder="وصف مختصر للجريمة"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>نوع الجريمة</Label>
                <Select
                  value={caseForm.case_type}
                  onValueChange={(value) => setCaseForm({...caseForm, case_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label>الأولوية</Label>
                <Select
                  value={caseForm.priority}
                  onValueChange={(value) => setCaseForm({...caseForm, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">وصف تفصيلي *</Label>
              <Textarea
                id="description"
                value={caseForm.description}
                onChange={(e) => setCaseForm({...caseForm, description: e.target.value})}
                placeholder="اكتب وصفاً تفصيلياً للجريمة والأضرار والأدلة المتاحة"
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={createCase}
              disabled={!caseForm.title || !caseForm.description}
              className="bg-primary hover:bg-primary/90"
            >
              إرسال التقرير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة دليل رقمي</DialogTitle>
            <DialogDescription>
              أضف دليلاً رقمياً لقضية موجودة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>القضية</Label>
              <Select
                value={evidenceForm.case_id}
                onValueChange={(value) => setEvidenceForm({...evidenceForm, case_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القضية" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map(case_ => (
                    <SelectItem key={case_.id} value={case_.id}>
                      {case_.case_number} - {case_.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>نوع الدليل</Label>
              <Select
                value={evidenceForm.evidence_type}
                onValueChange={(value) => setEvidenceForm({...evidenceForm, evidence_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="description">وصف الدليل</Label>
              <Textarea
                id="description"
                value={evidenceForm.description}
                onChange={(e) => setEvidenceForm({...evidenceForm, description: e.target.value})}
                placeholder="وصف تفصيلي للدليل ومصدره وأهميته"
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file_url">رابط الملف (اختياري)</Label>
              <Input
                id="file_url"
                value={evidenceForm.file_url}
                onChange={(e) => setEvidenceForm({...evidenceForm, file_url: e.target.value})}
                placeholder="https://example.com/evidence.pdf"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={createEvidence}
              disabled={!evidenceForm.case_id || !evidenceForm.description}
              className="bg-primary hover:bg-primary/90"
            >
              حفظ الدليل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
