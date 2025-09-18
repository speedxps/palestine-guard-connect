import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/PageHeader';
import BackButton from '@/components/BackButton';
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
  Mail
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CybercrimeAdvanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // محاكاة البيانات الإحصائية
  const monthlyData = [
    { month: 'يناير', cases: 23, solved: 18, pending: 5 },
    { month: 'فبراير', cases: 31, solved: 24, pending: 7 },
    { month: 'مارس', cases: 19, solved: 16, pending: 3 },
    { month: 'أبريل', cases: 27, solved: 21, pending: 6 },
    { month: 'مايو', cases: 34, solved: 29, pending: 5 },
    { month: 'يونيو', cases: 29, solved: 25, pending: 4 }
  ];

  const caseTypeData = [
    { name: 'الابتزاز الإلكتروني', value: 45, color: '#ef4444' },
    { name: 'الاحتيال المالي', value: 32, color: '#f97316' },
    { name: 'اختراق الأنظمة', value: 18, color: '#8b5cf6' },
    { name: 'التهديد الإلكتروني', value: 25, color: '#06b6d4' },
    { name: 'انتهاك الخصوصية', value: 12, color: '#10b981' }
  ];

  const recentCases = [
    {
      id: 'CYB001',
      title: 'ابتزاز إلكتروني - الخليل',
      type: 'ابتزاز',
      severity: 'عالي',
      status: 'قيد التحقيق',
      assignedTo: 'المحقق أحمد',
      dateCreated: '2024-01-15',
      confidentiality: 'سري للغاية'
    },
    {
      id: 'CYB002', 
      title: 'احتيال مصرفي - بيت لحم',
      type: 'احتيال',
      severity: 'متوسط',
      status: 'تم الحل',
      assignedTo: 'المحققة فاطمة',
      dateCreated: '2024-01-14',
      confidentiality: 'محدود'
    },
    {
      id: 'CYB003',
      title: 'اختراق موقع حكومي',
      type: 'اختراق',
      severity: 'عالي جداً',
      status: 'عاجل',
      assignedTo: 'فريق الطوارئ',
      dateCreated: '2024-01-16',
      confidentiality: 'سري للغاية'
    }
  ];

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'عالي جداً': 'bg-red-100 text-red-800 border-red-200',
      'عالي': 'bg-orange-100 text-orange-800 border-orange-200',
      'متوسط': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'منخفض': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'عاجل': 'bg-red-500 text-white',
      'قيد التحقيق': 'bg-blue-500 text-white',
      'تم الحل': 'bg-green-500 text-white',
      'مؤجل': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

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
                  <p className="text-2xl font-bold text-red-600">18</p>
                  <p className="text-xs text-gray-500">+3 هذا الأسبوع</p>
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
                  <p className="text-2xl font-bold text-green-600">143</p>
                  <p className="text-xs text-gray-500">+12 هذا الشهر</p>
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
                  <p className="text-2xl font-bold text-blue-600">89%</p>
                  <p className="text-xs text-gray-500">+5% من الشهر الماضي</p>
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
                  <p className="text-2xl font-bold text-purple-600">7</p>
                  <p className="text-xs text-gray-500">متاح: 5</p>
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
              {/* Monthly Trend Chart */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-arabic flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    اتجاه القضايا الشهري
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="cases" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="solved" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Case Types Distribution */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-arabic">توزيع أنواع القضايا</CardTitle>
                </CardHeader>
                <CardContent>
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
                        <span className="text-gray-600">{type.name}</span>
                      </div>
                    ))}
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
                      <SelectItem value="ابتزاز">ابتزاز إلكتروني</SelectItem>
                      <SelectItem value="احتيال">احتيال مالي</SelectItem>
                      <SelectItem value="اختراق">اختراق أنظمة</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    قضية جديدة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cases List */}
            <div className="grid gap-4">
              {recentCases.map((case_) => (
                <Card key={case_.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {case_.id}
                          </Badge>
                          <Badge className={getSeverityColor(case_.severity)}>
                            {case_.severity}
                          </Badge>
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {case_.confidentiality}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 font-arabic mb-1">
                          {case_.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>المحقق: {case_.assignedTo}</span>
                          <span>التاريخ: {case_.dateCreated}</span>
                          <span>النوع: {case_.type}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <Download className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold font-arabic mb-2">التقرير الشهري</h3>
                <p className="text-sm text-gray-600 mb-4">تقرير شامل عن أنشطة الشهر</p>
                <Button size="sm" className="w-full">تحميل PDF</Button>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold font-arabic mb-2">تحليل الاتجاهات</h3>
                <p className="text-sm text-gray-600 mb-4">تحليل إحصائي للجرائم</p>
                <Button size="sm" className="w-full" variant="outline">عرض التحليل</Button>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <Shield className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold font-arabic mb-2">تقرير الأمان</h3>
                <p className="text-sm text-gray-600 mb-4">حالة الأمن السيبراني</p>
                <Button size="sm" className="w-full" variant="outline">عرض التقرير</Button>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-red-50/80 backdrop-blur-sm border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 font-arabic">تحذير عاجل - نشاط مشبوه</h4>
                    <p className="text-red-700 text-sm mb-2">
                      تم اكتشاف محاولات اختراق متعددة من نفس عنوان IP
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive">التحقق الفوري</Button>
                      <Button size="sm" variant="outline">تجاهل</Button>
                    </div>
                  </div>
                  <span className="text-xs text-red-600">منذ 5 دقائق</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800 font-arabic">تنبيه متوسط - زيادة في البلاغات</h4>
                    <p className="text-yellow-700 text-sm mb-2">
                      زيادة بنسبة 25% في بلاغات الابتزاز الإلكتروني هذا الأسبوع
                    </p>
                    <Button size="sm" variant="outline">عرض التفاصيل</Button>
                  </div>
                  <span className="text-xs text-yellow-600">منذ ساعة</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Action Buttons */}
        <div className="fixed bottom-6 left-6 flex flex-col gap-3">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg bg-red-600 hover:bg-red-700"
            onClick={() => toast({ title: "طوارئ!", description: "تم إرسال إشعار للفريق" })}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="rounded-full shadow-lg bg-white"
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CybercrimeAdvanced;