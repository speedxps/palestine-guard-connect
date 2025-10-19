import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCybercrimeCases } from '@/hooks/useCybercrimeCases';
import { useTickets } from '@/hooks/useTickets';
import { useSuspiciousLogins } from '@/hooks/useSuspiciousLogins';
import FileUploadDialog from '@/components/FileUploadDialog';
import { 
  ArrowLeft, 
  Shield, 
  BarChart3, 
  FileText, 
  Plus,
  Eye,
  Lock,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Clock,
  Users,
  Globe,
  Smartphone,
  Computer,
  CreditCard,
  Mail,
  Loader2
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

const CybercrimeAdvanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { logTicket } = useTickets();
  const { cases, stats, loading, createCase, updateCaseStatus } = useCybercrimeCases();
  const { suspiciousLogins, updateLoginStatus } = useSuspiciousLogins();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    case_type: 'phishing',
    priority: 'medium'
  });

  // Filter and search cases
  const filteredCases = useMemo(() => {
    return cases.filter(case_ => {
      const matchesSearch = searchQuery === '' || 
        case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || case_.case_type === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [cases, searchQuery, filterType]);

  // Calculate case type distribution for chart
  const caseTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    cases.forEach(case_ => {
      typeCounts[case_.case_type] = (typeCounts[case_.case_type] || 0) + 1;
    });

    const colorMap: Record<string, string> = {
      'phishing': '#ef4444',
      'fraud': '#f97316',
      'hacking': '#8b5cf6',
      'cyberbullying': '#06b6d4',
      'identity_theft': '#10b981',
      'malware': '#ec4899',
      'other': '#6b7280'
    };

    const nameMap: Record<string, string> = {
      'phishing': 'الابتزاز الإلكتروني',
      'fraud': 'الاحتيال المالي',
      'hacking': 'اختراق الأنظمة',
      'cyberbullying': 'التهديد الإلكتروني',
      'identity_theft': 'انتهاك الخصوصية',
      'malware': 'البرمجيات الخبيثة',
      'other': 'أخرى'
    };

    return Object.entries(typeCounts).map(([type, value]) => ({
      name: nameMap[type] || type,
      value,
      color: colorMap[type] || '#6b7280'
    }));
  }, [cases]);

  const getSeverityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'bg-red-500 text-white',
      'investigating': 'bg-blue-500 text-white',
      'resolved': 'bg-green-500 text-white',
      'closed': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'open': 'جديد',
      'investigating': 'قيد التحقيق',
      'resolved': 'تم الحل',
      'closed': 'مغلق'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'critical': 'عالي جداً',
      'high': 'عالي',
      'medium': 'متوسط',
      'low': 'منخفض'
    };
    return priorityMap[priority] || priority;
  };

  const getCaseTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'phishing': 'ابتزاز إلكتروني',
      'fraud': 'احتيال مالي',
      'hacking': 'اختراق أنظمة',
      'cyberbullying': 'تهديد إلكتروني',
      'identity_theft': 'انتهاك خصوصية',
      'malware': 'برمجيات خبيثة',
      'other': 'أخرى'
    };
    return typeMap[type] || type;
  };

  const handleCreateCase = async () => {
    if (!newCase.title || !newCase.description) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCase(newCase);
      await logTicket({
        section: 'cybercrime_advanced',
        action_type: 'create',
        description: `إنشاء قضية جديدة: ${newCase.title}`,
      });
      setIsCreateDialogOpen(false);
      setNewCase({
        title: '',
        description: '',
        case_type: 'phishing',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating case:', error);
    }
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/cybercrime-reports?caseId=${caseId}`);
  };

  const generateMonthlyReport = async () => {
    try {
      const doc = new jsPDF();
      
      // إضافة الشعار
      const logoImg = '/lovable-uploads/b1560465-346a-4180-a2b3-7f08124d1116.png';
      try {
        doc.addImage(logoImg, 'PNG', 15, 10, 30, 30);
      } catch (e) {
        console.log('Could not add logo');
      }

      // العنوان
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Palestinian Police Force', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Cybercrime Unit', 105, 28, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Monthly Cybercrime Report', 105, 36, { align: 'center' });
      
      // التاريخ
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${new Date().toLocaleDateString('en-US')}`, 105, 44, { align: 'center' });
      
      // خط فاصل
      doc.setLineWidth(0.5);
      doc.line(15, 48, 195, 48);
      
      let yPos = 60;
      
      // الإحصائيات الرئيسية
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Statistics:', 15, yPos);
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Cases: ${cases.length}`, 20, yPos);
      yPos += 8;
      doc.text(`Active Cases: ${stats?.activeCases || 0}`, 20, yPos);
      yPos += 8;
      doc.text(`Solved Cases: ${stats?.solvedCases || 0}`, 20, yPos);
      yPos += 8;
      doc.text(`Resolution Rate: ${stats?.resolutionRate || 0}%`, 20, yPos);
      yPos += 8;
      doc.text(`Investigators: ${stats?.investigators || 0}`, 20, yPos);
      yPos += 15;
      
      // توزيع أنواع الجرائم
      doc.setFont('helvetica', 'bold');
      doc.text('Case Type Distribution:', 15, yPos);
      yPos += 10;
      
      const caseTypes: Record<string, number> = {};
      cases.forEach(c => {
        caseTypes[c.case_type] = (caseTypes[c.case_type] || 0) + 1;
      });
      
      doc.setFont('helvetica', 'normal');
      Object.entries(caseTypes).forEach(([type, count]) => {
        doc.text(`- ${type}: ${count} cases`, 20, yPos);
        yPos += 7;
      });
      
      yPos += 10;
      
      // آخر 10 قضايا
      doc.setFont('helvetica', 'bold');
      doc.text('Recent Cases (Last 10):', 15, yPos);
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      cases.slice(0, 10).forEach((case_, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${case_.case_number}`, 20, yPos);
        yPos += 6;
        doc.text(`   ${case_.title}`, 20, yPos);
        yPos += 6;
        doc.text(`   Status: ${case_.status} | Priority: ${case_.priority}`, 20, yPos);
        yPos += 10;
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Confidential - Page ${i} of ${pageCount}`,
          105,
          285,
          { align: 'center' }
        );
      }

      doc.save(`cybercrime_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      await logTicket({
        section: 'cybercrime_advanced',
        action_type: 'view',
        description: 'تحميل التقرير الشهري',
      });

      toast({
        title: 'نجح',
        description: 'تم تحميل التقرير بنجاح',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء التقرير',
        variant: 'destructive',
      });
    }
  };

  const sendEmergencyNotification = async () => {
    try {
      await logTicket({
        section: 'cybercrime_advanced',
        action_type: 'create',
        description: 'إرسال إشعار طوارئ للفريق',
        metadata: { priority: 'critical' }
      });

      toast({ 
        title: "طوارئ!", 
        description: "تم إرسال إشعار للفريق",
        variant: 'destructive'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-blue-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-arabic">
                    لوحة التحكم المتقدمة - الجرائم الإلكترونية
                  </h1>
                  <p className="text-sm text-gray-600">نظام إدارة الأمن السيبراني</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="font-arabic">
                سري للغاية
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">القضايا النشطة</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.activeCases || 0}</p>
                  <p className="text-xs text-gray-500">+{stats?.weeklyIncrease || 0} هذا الأسبوع</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تم الحل</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.solvedCases || 0}</p>
                  <p className="text-xs text-gray-500">+{stats?.monthlyIncrease || 0} هذا الشهر</p>
                </div>
                <Lock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معدل الحل</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.resolutionRate || 0}%</p>
                  <p className="text-xs text-gray-500">من إجمالي القضايا</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المحققون</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.investigators || 0}</p>
                  <p className="text-xs text-gray-500">المسجلون في النظام</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="font-arabic">لوحة المؤشرات</TabsTrigger>
            <TabsTrigger value="cases" className="font-arabic">إدارة القضايا</TabsTrigger>
            <TabsTrigger value="reports" className="font-arabic">التقارير</TabsTrigger>
            <TabsTrigger value="alerts" className="font-arabic">التنبيهات</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case Types Distribution */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-arabic">توزيع أنواع القضايا</CardTitle>
                </CardHeader>
                <CardContent>
                  {caseTypeData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={caseTypeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                          >
                            {caseTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        {caseTypeData.map((type, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            <span className="text-gray-600">{type.name} ({type.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      لا توجد بيانات متاحة
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Cases Summary */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-arabic">ملخص القضايا الأخيرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredCases.slice(0, 5).map((case_) => (
                      <div key={case_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono">
                              {case_.case_number}
                            </Badge>
                            <Badge className={getStatusColor(case_.status)}>
                              {getStatusText(case_.status)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{case_.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(case_.created_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewCase(case_.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {filteredCases.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        لا توجد قضايا
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cases Management Tab */}
          <TabsContent value="cases" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="البحث في القضايا..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="فلتر حسب النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع القضايا</SelectItem>
                      <SelectItem value="phishing">ابتزاز إلكتروني</SelectItem>
                      <SelectItem value="fraud">احتيال مالي</SelectItem>
                      <SelectItem value="hacking">اختراق أنظمة</SelectItem>
                      <SelectItem value="cyberbullying">تهديد إلكتروني</SelectItem>
                      <SelectItem value="identity_theft">انتهاك خصوصية</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        قضية جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="font-arabic">إنشاء قضية جديدة</DialogTitle>
                        <DialogDescription>
                          أدخل تفاصيل القضية الإلكترونية الجديدة
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">عنوان القضية *</Label>
                          <Input
                            id="title"
                            value={newCase.title}
                            onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                            placeholder="مثال: ابتزاز إلكتروني - الخليل"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">الوصف *</Label>
                          <Textarea
                            id="description"
                            value={newCase.description}
                            onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                            placeholder="وصف تفصيلي للقضية..."
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="case_type">نوع القضية</Label>
                          <Select 
                            value={newCase.case_type} 
                            onValueChange={(value) => setNewCase({ ...newCase, case_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phishing">ابتزاز إلكتروني</SelectItem>
                              <SelectItem value="fraud">احتيال مالي</SelectItem>
                              <SelectItem value="hacking">اختراق أنظمة</SelectItem>
                              <SelectItem value="cyberbullying">تهديد إلكتروني</SelectItem>
                              <SelectItem value="identity_theft">انتهاك خصوصية</SelectItem>
                              <SelectItem value="malware">برمجيات خبيثة</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">الأولوية</Label>
                          <Select 
                            value={newCase.priority} 
                            onValueChange={(value) => setNewCase({ ...newCase, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">منخفض</SelectItem>
                              <SelectItem value="medium">متوسط</SelectItem>
                              <SelectItem value="high">عالي</SelectItem>
                              <SelectItem value="critical">عالي جداً</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          إلغاء
                        </Button>
                        <Button onClick={handleCreateCase}>
                          إنشاء القضية
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Cases List */}
            <div className="grid gap-4">
              {filteredCases.map((case_) => (
                <Card key={case_.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge variant="outline" className="font-mono">
                            {case_.case_number}
                          </Badge>
                          <Badge className={getSeverityColor(case_.priority)}>
                            {getPriorityText(case_.priority)}
                          </Badge>
                          <Badge className={getStatusColor(case_.status)}>
                            {getStatusText(case_.status)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 font-arabic mb-1">
                          {case_.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {case_.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>النوع: {getCaseTypeText(case_.case_type)}</span>
                          <span>التاريخ: {new Date(case_.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCase(case_.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/cybercrime-reports?caseId=${case_.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredCases.length === 0 && (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center text-gray-500">
                    {searchQuery || filterType !== 'all' 
                      ? 'لا توجد قضايا مطابقة لمعايير البحث'
                      : 'لا توجد قضايا حالياً. انقر على "قضية جديدة" للبدء'
                    }
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card 
                className="bg-white/80 backdrop-blur-sm p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={generateMonthlyReport}
              >
                <Download className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold font-arabic mb-2">التقرير الشهري</h3>
                <p className="text-sm text-gray-600 mb-4">تقرير شامل عن أنشطة الشهر</p>
                <Button size="sm" className="w-full">تحميل PDF</Button>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-sm p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/cybercrime-trend-analysis')}
              >
                <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold font-arabic mb-2">تحليل الاتجاهات</h3>
                <p className="text-sm text-gray-600 mb-4">تحليل إحصائي للجرائم</p>
                <Button size="sm" className="w-full" variant="outline">
                  عرض التحليل
                </Button>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-sm p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/cybercrime-security-report')}
              >
                <Shield className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold font-arabic mb-2">تقرير الأمان</h3>
                <p className="text-sm text-gray-600 mb-4">حالة الأمن السيبراني</p>
                <Button size="sm" className="w-full" variant="outline">
                  عرض التقرير
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {/* Suspicious Login Attempts */}
            {suspiciousLogins.filter(l => l.status === 'pending').length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-red-800 font-arabic flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  محاولات دخول مشبوهة ({suspiciousLogins.filter(l => l.status === 'pending').length})
                </h3>
                {suspiciousLogins.filter(l => l.status === 'pending').slice(0, 5).map((login) => (
                  <Card key={login.id} className="bg-red-50/80 backdrop-blur-sm border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-red-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-800 font-arabic">
                            ⚠️ محاولة دخول من خارج فلسطين
                          </h4>
                          <div className="text-red-700 text-sm space-y-1 mt-2">
                            <p><strong>البريد:</strong> {login.email}</p>
                            <p><strong>الموقع:</strong> {login.country} - {login.city}</p>
                            <p><strong>IP:</strong> {login.ip_address}</p>
                            {login.latitude && login.longitude && (
                              <p><strong>الإحداثيات:</strong> {login.latitude}, {login.longitude}</p>
                            )}
                            <p><strong>الوقت:</strong> {new Date(login.attempt_time).toLocaleString('ar-EG')}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                updateLoginStatus(login.id, 'investigated', 'تم التحقق من المحاولة');
                                toast({ title: 'تم', description: 'تم وضع علامة كـ"تم التحقق"' });
                              }}
                            >
                              تم التحقق
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                updateLoginStatus(login.id, 'ignored', 'محاولة آمنة');
                                toast({ title: 'تم', description: 'تم تجاهل التنبيه' });
                              }}
                            >
                              تجاهل
                            </Button>
                          </div>
                        </div>
                        <Badge variant="destructive" className="whitespace-nowrap">
                          {login.severity === 'high' ? 'عالي' : login.severity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Critical Cases */}
            {filteredCases.filter(c => c.priority === 'critical').length > 0 ? (
              <Card className="bg-red-50/80 backdrop-blur-sm border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-red-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 font-arabic">تحذير عاجل - قضايا بأولوية عالية جداً</h4>
                      <p className="text-red-700 text-sm mb-2">
                        يوجد {filteredCases.filter(c => c.priority === 'critical').length} قضية بأولوية عالية جداً تتطلب اهتماماً فورياً
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setFilterType('all');
                            document.querySelector('[value="cases"]')?.dispatchEvent(new MouseEvent('click'));
                          }}
                        >
                          التحقق الفوري
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-red-600">الآن</span>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {stats && stats.weeklyIncrease > 5 ? (
              <Card className="bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800 font-arabic">تنبيه متوسط - زيادة في البلاغات</h4>
                      <p className="text-yellow-700 text-sm mb-2">
                        زيادة بنسبة {stats.weeklyIncrease} قضية جديدة هذا الأسبوع
                      </p>
                      <Button size="sm" variant="outline">عرض التفاصيل</Button>
                    </div>
                    <span className="text-xs text-yellow-600">هذا الأسبوع</span>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {suspiciousLogins.filter(l => l.status === 'pending').length === 0 && 
             filteredCases.filter(c => c.priority === 'critical').length === 0 && 
             (!stats || stats.weeklyIncrease <= 5) ? (
              <Card className="bg-green-50/80 backdrop-blur-sm border-green-200">
                <CardContent className="p-8 text-center">
                  <Lock className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 font-arabic mb-2">لا توجد تنبيهات عاجلة</h4>
                  <p className="text-green-700 text-sm">
                    جميع القضايا تحت السيطرة. النظام يعمل بشكل طبيعي.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>

        <FileUploadDialog
          open={isFileUploadOpen}
          onOpenChange={setIsFileUploadOpen}
          cases={cases.map(c => ({ id: c.id, case_number: c.case_number, title: c.title }))}
          onUploadComplete={() => {
            toast({ title: 'نجح', description: 'تم رفع الملفات بنجاح' });
          }}
        />

        {/* Quick Action Buttons */}
        <div className="fixed bottom-6 left-6 flex flex-col gap-3">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg bg-red-600 hover:bg-red-700"
            onClick={sendEmergencyNotification}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="rounded-full shadow-lg bg-white"
            onClick={() => setIsFileUploadOpen(true)}
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CybercrimeAdvanced;
