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

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  is_active: boolean;
  created_at: string;
}

interface EducationMaterial {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'infographic' | 'guide';
  content?: string;
  thumbnail_url?: string;
  file_url?: string;
  tags?: string[];
  views_count: number;
  created_at: string;
}

interface Investigation {
  id: string;
  case_id: string;
  investigator_id: string;
  status: 'active' | 'pending' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  findings?: string;
  next_steps?: string;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

interface RiskAssessment {
  id: string;
  case_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  threat_vectors?: string[];
  impact_analysis?: string;
  mitigation_steps?: string;
  assessed_by: string;
  assessed_at: string;
}

export default function CybercrimeAdvancedDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cases, setCases] = useState<CybercrimeCase[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [educationMaterials, setEducationMaterials] = useState<EducationMaterial[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showEvidenceDetailsDialog, setShowEvidenceDetailsDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CybercrimeCase | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<EducationMaterial | null>(null);
  
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
      const [casesRes, evidenceRes, alertsRes, materialsRes, investigationsRes, assessmentsRes] = await Promise.all([
        supabase.from('cybercrime_cases').select('*').order('created_at', { ascending: false }),
        supabase.from('cybercrime_evidence').select('*').order('collected_at', { ascending: false }),
        supabase.from('security_alerts').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('education_materials').select('*').order('created_at', { ascending: false }),
        supabase.from('investigations').select('*').order('created_at', { ascending: false }),
        supabase.from('risk_assessments').select('*').order('assessed_at', { ascending: false })
      ]);

      if (casesRes.error) throw casesRes.error;
      if (evidenceRes.error) throw evidenceRes.error;
      if (alertsRes.error) throw alertsRes.error;
      if (materialsRes.error) throw materialsRes.error;
      if (investigationsRes.error) throw investigationsRes.error;
      if (assessmentsRes.error) throw assessmentsRes.error;

      setCases(casesRes.data || []);
      setEvidence(evidenceRes.data || []);
      setAlerts((alertsRes.data || []) as SecurityAlert[]);
      setEducationMaterials((materialsRes.data || []) as EducationMaterial[]);
      setInvestigations((investigationsRes.data || []) as Investigation[]);
      setRiskAssessments((assessmentsRes.data || []) as RiskAssessment[]);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return BookOpen;
      case 'video': return Video;
      case 'infographic': return ImageIcon;
      case 'guide': return FileText;
      default: return FileText;
    }
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(item.file_url, '_blank')}
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="mr-1 hidden sm:inline">تحميل</span>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedEvidence(item);
                            setShowEvidenceDetailsDialog(true);
                          }}
                        >
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
                التحذيرات والتنبيهات ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا توجد تحذيرات نشطة حالياً</p>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`border-l-4 p-3 md:p-4 rounded ${
                        alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                        alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                        alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                        'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 md:h-5 md:w-5 ${
                              alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'high' ? 'text-orange-500' :
                              alert.severity === 'medium' ? 'text-amber-500' :
                              'text-green-500'
                            }`} />
                            <h4 className={`font-semibold text-sm md:text-base ${
                              alert.severity === 'critical' ? 'text-red-700' :
                              alert.severity === 'high' ? 'text-orange-700' :
                              alert.severity === 'medium' ? 'text-amber-700' :
                              'text-green-700'
                            }`}>
                              {alert.title}
                            </h4>
                            <Badge className={getSeverityColor(alert.severity) + " text-xs"}>
                              {alert.severity === 'critical' ? 'حرج' :
                               alert.severity === 'high' ? 'عالي' :
                               alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                          <p className={`text-xs md:text-sm ${
                            alert.severity === 'critical' ? 'text-red-700' :
                            alert.severity === 'high' ? 'text-orange-700' :
                            alert.severity === 'medium' ? 'text-amber-700' :
                            'text-green-700'
                          }`}>
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                التوعية والتعليم ({educationMaterials.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {educationMaterials.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا توجد مواد تعليمية حالياً</p>
              ) : (
                <div className="grid gap-4 md:gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {educationMaterials.map((material) => {
                      const IconComponent = getMaterialTypeIcon(material.type);
                      return (
                        <Card 
                          key={material.id} 
                          className="p-3 md:p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                          onClick={() => setSelectedMaterial(material)}
                        >
                          <div className="flex items-center gap-3 mb-2 md:mb-3">
                            <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm md:text-base line-clamp-1">
                                {material.title}
                              </h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {material.type === 'article' ? 'مقال' :
                                 material.type === 'video' ? 'فيديو' :
                                 material.type === 'infographic' ? 'إنفوجرافيك' : 'دليل'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {material.description}
                          </p>
                          {material.tags && material.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {material.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {material.views_count} مشاهدة
                            </span>
                            <span>{new Date(material.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investigations Tab */}
        <TabsContent value="investigations" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
                التحقيقات ومتابعة الجرائم ({investigations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {investigations.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا توجد تحقيقات جارية حالياً</p>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {investigations.map((investigation) => {
                    const relatedCase = cases.find(c => c.id === investigation.case_id);
                    return (
                      <div key={investigation.id} className="border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-sm md:text-base">
                              {relatedCase?.title || 'قضية غير معروفة'}
                            </h4>
                            <Badge className={`text-xs ${
                              investigation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              investigation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              investigation.status === 'suspended' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {investigation.status === 'completed' ? 'مكتمل' :
                               investigation.status === 'active' ? 'نشط' :
                               investigation.status === 'suspended' ? 'معلق' : 'معلق'}
                            </Badge>
                            <Badge className={`text-xs ${
                              investigation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              investigation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              investigation.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {investigation.priority === 'urgent' ? 'عاجل' :
                               investigation.priority === 'high' ? 'عالي' :
                               investigation.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                          {investigation.findings && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <Label className="text-xs font-semibold">النتائج:</Label>
                              <p className="text-xs md:text-sm mt-1">{investigation.findings}</p>
                            </div>
                          )}
                          {investigation.next_steps && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <Label className="text-xs font-semibold text-blue-700">الخطوات القادمة:</Label>
                              <p className="text-xs md:text-sm mt-1 text-blue-600">{investigation.next_steps}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>تم البدء: {new Date(investigation.created_at).toLocaleDateString('ar-SA')}</span>
                            {investigation.completion_date && (
                              <span>تم الإكمال: {new Date(investigation.completion_date).toLocaleDateString('ar-SA')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                تقييم المخاطر ({riskAssessments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {riskAssessments.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا توجد تقييمات مخاطر حالياً</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskAssessments.map((assessment) => {
                    const relatedCase = cases.find(c => c.id === assessment.case_id);
                    return (
                      <Card key={assessment.id} className="p-3 md:p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm md:text-base line-clamp-1">
                              {relatedCase?.title || 'قضية غير معروفة'}
                            </h4>
                            <Badge className={getSeverityColor(assessment.risk_level) + " text-xs"}>
                              {assessment.risk_level === 'critical' ? 'حرج' :
                               assessment.risk_level === 'high' ? 'عالي' :
                               assessment.risk_level === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  assessment.risk_score >= 75 ? 'bg-red-500' :
                                  assessment.risk_score >= 50 ? 'bg-orange-500' :
                                  assessment.risk_score >= 25 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${assessment.risk_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold">{assessment.risk_score}%</span>
                          </div>
                          
                          {assessment.threat_vectors && assessment.threat_vectors.length > 0 && (
                            <div>
                              <Label className="text-xs font-semibold">ناقلات التهديد:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {assessment.threat_vectors.map((vector, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {vector}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {assessment.impact_analysis && (
                            <div className="bg-muted/50 p-2 rounded">
                              <Label className="text-xs font-semibold">تحليل التأثير:</Label>
                              <p className="text-xs mt-1 line-clamp-2">{assessment.impact_analysis}</p>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            تم التقييم: {new Date(assessment.assessed_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
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
              <div className="grid gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <p className="text-xs text-muted-foreground">إجمالي القضايا</p>
                    <p className="text-2xl font-bold text-blue-600">{cases.length}</p>
                  </Card>
                  <Card className="p-4 bg-green-50">
                    <p className="text-xs text-muted-foreground">القضايا المحلولة</p>
                    <p className="text-2xl font-bold text-green-600">
                      {cases.filter(c => c.status === 'resolved').length}
                    </p>
                  </Card>
                  <Card className="p-4 bg-amber-50">
                    <p className="text-xs text-muted-foreground">قيد التحقيق</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {cases.filter(c => c.status === 'investigating').length}
                    </p>
                  </Card>
                  <Card className="p-4 bg-red-50">
                    <p className="text-xs text-muted-foreground">قضايا مفتوحة</p>
                    <p className="text-2xl font-bold text-red-600">
                      {cases.filter(c => c.status === 'open').length}
                    </p>
                  </Card>
                </div>
                
                <Card className="p-4">
                  <h4 className="font-semibold mb-4 text-sm md:text-base">توزيع القضايا حسب النوع</h4>
                  <div className="space-y-3">
                    {['fraud', 'hacking', 'phishing', 'malware'].map(type => {
                      const count = cases.filter(c => c.case_type === type).length;
                      const percentage = cases.length > 0 ? (count / cases.length * 100).toFixed(1) : 0;
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{getCaseTypeText(type)}</span>
                            <span className="text-sm font-medium">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-sm md:text-base">نسبة الحل</h4>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="56" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            fill="none" 
                            className="text-gray-200"
                          />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="56" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray={`${((cases.filter(c => c.status === 'resolved').length / cases.length) * 352) || 0} 352`}
                            className="text-green-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {cases.length > 0 ? Math.round((cases.filter(c => c.status === 'resolved').length / cases.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-sm md:text-base">إحصائيات التحذيرات</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحذيرات حرجة</span>
                        <Badge className="bg-red-100 text-red-800">
                          {alerts.filter(a => a.severity === 'critical').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحذيرات عالية</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {alerts.filter(a => a.severity === 'high').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحذيرات متوسطة</span>
                        <Badge className="bg-amber-100 text-amber-800">
                          {alerts.filter(a => a.severity === 'medium').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تحذيرات منخفضة</span>
                        <Badge className="bg-green-100 text-green-800">
                          {alerts.filter(a => a.severity === 'low').length}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
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

      {/* Evidence Details Dialog */}
      <Dialog open={showEvidenceDetailsDialog} onOpenChange={setShowEvidenceDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">تفاصيل الدليل الرقمي</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              معلومات تفصيلية عن الدليل
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvidence && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">نوع الدليل</Label>
                <Badge variant="outline" className="w-fit text-xs">
                  {getEvidenceTypeText(selectedEvidence.evidence_type)}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">الوصف</Label>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedEvidence.description}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">تاريخ الجمع</Label>
                <p className="text-sm">
                  {new Date(selectedEvidence.collected_at).toLocaleString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {selectedEvidence.file_url && (
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">الملف المرفق</Label>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-700 flex-1 truncate">
                      {selectedEvidence.file_url}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(selectedEvidence.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      <span className="mr-1 hidden sm:inline">تحميل</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setShowEvidenceDetailsDialog(false)}
              variant="outline"
              className="w-full sm:w-auto"
              size="sm"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Education Material Details Dialog */}
      <Dialog open={selectedMaterial !== null} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              {selectedMaterial?.title}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {selectedMaterial?.type === 'article' ? 'مقال' :
               selectedMaterial?.type === 'video' ? 'فيديو' :
               selectedMaterial?.type === 'infographic' ? 'إنفوجرافيك' : 'دليل'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">الوصف</Label>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedMaterial.description}
                </p>
              </div>
              
              {selectedMaterial.content && (
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">المحتوى</Label>
                  <div className="text-sm bg-muted/50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    {selectedMaterial.content}
                  </div>
                </div>
              )}
              
              {selectedMaterial.tags && selectedMaterial.tags.length > 0 && (
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">الوسوم</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedMaterial.file_url && (
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">الملف</Label>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(selectedMaterial.file_url!, '_blank')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تحميل الملف
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {selectedMaterial.views_count} مشاهدة
                </span>
                <span>
                  {new Date(selectedMaterial.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setSelectedMaterial(null)}
              variant="outline"
              className="w-full sm:w-auto"
              size="sm"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
