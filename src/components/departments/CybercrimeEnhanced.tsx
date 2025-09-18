import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Plus,
  AlertTriangle,
  Lock,
  Eye,
  TrendingUp,
  FileText,
  Users,
  Clock,
  Target,
  Database,
  Wifi,
  Smartphone
} from 'lucide-react';

const CybercrimeEnhanced = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const threatAnalysis = [
    { type: 'تصيد إلكتروني', count: 15, trend: '+12%', severity: 'عالي' },
    { type: 'برامج ضارة', count: 8, trend: '-5%', severity: 'متوسط' },
    { type: 'اختراق حسابات', count: 12, trend: '+8%', severity: 'عالي' },
    { type: 'احتيال مالي', count: 6, trend: '+20%', severity: 'عالي' },
    { type: 'سرقة بيانات', count: 4, trend: '-2%', severity: 'منخفض' }
  ];

  const recentCases = [
    {
      id: 'CYB-001',
      title: 'اختراق موقع بنك فلسطين',
      status: 'قيد التحقيق',
      priority: 'عالي',
      assignee: 'محقق سيبراني أول',
      date: '2024-01-15'
    },
    {
      id: 'CYB-002', 
      title: 'تصيد إلكتروني لبيانات العملاء',
      status: 'جديد',
      priority: 'عاجل',
      assignee: 'غير محدد',
      date: '2024-01-14'
    },
    {
      id: 'CYB-003',
      title: 'برامج فدية في الجامعة الإسلامية',
      status: 'مكتمل',
      priority: 'متوسط',
      assignee: 'فريق الاستجابة السريعة',
      date: '2024-01-13'
    }
  ];

  const digitalForensics = [
    { tool: 'تحليل الأجهزة المحمولة', cases: 23, success: '89%' },
    { tool: 'استرداد البيانات المحذوفة', cases: 18, success: '95%' },
    { tool: 'تحليل الشبكات', cases: 31, success: '87%' },
    { tool: 'كسر كلمات المرور', cases: 12, success: '78%' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'عالي': return 'bg-red-500';
      case 'متوسط': return 'bg-yellow-500';
      case 'منخفض': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'عاجل': return 'bg-red-600 text-white';
      case 'عالي': return 'bg-orange-500 text-white';
      case 'متوسط': return 'bg-yellow-500 text-black';
      case 'منخفض': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-arabic">قسم الجرائم الإلكترونية المتقدم</h1>
            <p className="text-muted-foreground font-arabic">أمان رقمي شامل ومكافحة الجرائm السيبرانية</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/cybercrime-reports')}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          بلاغ جديد
        </Button>
      </div>

      {/* Advanced Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-arabic flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث المتقدم في القضايا
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="البحث في القضايا، المشتبه بهم، أو الأدلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Target className="h-4 w-4 ml-2" />
              بحث متقدم
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threat Analysis Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-arabic">تحليل التهديدات الحية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threatAnalysis.map((threat, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getSeverityColor(threat.severity)}`}></div>
                    <div>
                      <p className="font-medium font-arabic">{threat.type}</p>
                      <p className="text-sm text-muted-foreground">{threat.count} حالة نشطة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={threat.trend.startsWith('+') ? 'destructive' : 'default'}>
                      {threat.trend}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                <div className="text-3xl font-bold text-indigo-600 mb-1">127</div>
                <div className="text-sm font-arabic text-muted-foreground">قضية هذا الشهر</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <div className="text-3xl font-bold text-green-600 mb-1">89%</div>
                <div className="text-sm font-arabic text-muted-foreground">معدل الحل</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                <div className="text-3xl font-bold text-orange-600 mb-1">15</div>
                <div className="text-sm font-arabic text-muted-foreground">قضايا عاجلة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-arabic flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              القضايا الحديثة
            </span>
            <Button variant="outline" size="sm">
              عرض الكل
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 font-arabic">رقم القضية</th>
                  <th className="text-right py-3 font-arabic">العنوان</th>
                  <th className="text-right py-3 font-arabic">الحالة</th>
                  <th className="text-right py-3 font-arabic">الأولوية</th>
                  <th className="text-right py-3 font-arabic">المحقق</th>
                  <th className="text-right py-3 font-arabic">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((case_, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-mono">{case_.id}</td>
                    <td className="py-3 font-arabic">{case_.title}</td>
                    <td className="py-3">
                      <Badge variant="outline">{case_.status}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={getStatusColor(case_.priority)}>
                        {case_.priority}
                      </Badge>
                    </td>
                    <td className="py-3 font-arabic text-sm">{case_.assignee}</td>
                    <td className="py-3 text-sm">{case_.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Digital Forensics Tools */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-arabic flex items-center gap-2">
            <Database className="h-5 w-5" />
            أدوات التحقيق الرقمي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {digitalForensics.map((tool, index) => (
              <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-medium font-arabic text-sm">{tool.tool}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">القضايا:</span>
                    <span className="text-sm font-medium">{tool.cases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">النجاح:</span>
                    <span className="text-sm font-medium text-green-600">{tool.success}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex-col"
          onClick={() => navigate('/cybercrime-reports')}
        >
          <Plus className="h-6 w-6 mb-2" />
          <span className="font-arabic">إبلاغ عن جريمة</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col"
          onClick={() => navigate('/reports')}
        >
          <TrendingUp className="h-6 w-6 mb-2" />
          <span className="font-arabic">تحليل البيانات</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col"
        >
          <Users className="h-6 w-6 mb-2" />
          <span className="font-arabic">فريق التحقيق</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col"
        >
          <Wifi className="h-6 w-6 mb-2" />
          <span className="font-arabic">مراقبة الشبكات</span>
        </Button>
      </div>
    </div>
  );
};

export default CybercrimeEnhanced;