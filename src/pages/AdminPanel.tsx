import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserManagementTabbed } from '@/components/UserManagementTabbed';
import UserManagementProfessional from '@/components/UserManagementProfessional';
import { PasswordResetManagement } from '@/components/PasswordResetManagement';
import CybercrimeAccessManagement from '@/components/CybercrimeAccessManagement';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  Key, 
  UserCheck,
  Home,
  User,
  Database,
  BarChart3,
  AlertTriangle,
  Car,
  Eye,
  MessageCircle,
  CheckSquare
} from 'lucide-react';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // أقسام الإدارة مقسمة بحسب الوظائف
  const adminSections = [
    {
      id: 'overview',
      title: 'نظرة عامة',
      description: 'إحصائيات وملخص الأداء العام',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'user-management',
      title: 'إدارة الأقسام والمستخدمين',
      description: 'تعيين الأدوار وإدارة المستخدمين',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'traffic-management',
      title: 'إدارة شرطة المرور',
      description: 'إدارة المخالفات والمركبات',
      icon: Car,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'cid-management',
      title: 'إدارة المباحث الجنائية',
      description: 'إدارة البلاغات والمطلوبين',
      icon: Eye,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'special-management',
      title: 'إدارة الشرطة الخاصة',
      description: 'إدارة المهام والدوريات',
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'cybercrime-management',
      title: 'إدارة الجرائم الإلكترونية',
      description: 'منح الصلاحيات وإدارة التقارير',
      icon: MessageCircle,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'system-settings',
      title: 'إعدادات النظام',
      description: 'إعدادات متقدمة وصيانة',
      icon: Settings,
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const systemStats = [
    { label: 'إجمالي المستخدمين', value: '0', icon: Users, color: 'text-blue-500' },
    { label: 'البلاغات النشطة', value: '0', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'المهام قيد التنفيذ', value: '0', icon: FileText, color: 'text-green-500' },
    { label: 'الدوريات النشطة', value: '0', icon: UserCheck, color: 'text-purple-500' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 font-arabic">الإجراءات السريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminSections.slice(1, 4).map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted"
                onClick={() => setActiveTab(section.id)}
              >
                <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold font-arabic">{section.title}</p>
                  <p className="text-xs text-muted-foreground font-arabic">{section.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 font-arabic">النشاط الأخير</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-arabic">تم تسجيل دخول مستخدم جديد</p>
            <span className="text-xs text-muted-foreground mr-auto">منذ 5 دقائق</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-arabic">تم إنشاء بلاغ جديد</p>
            <span className="text-xs text-muted-foreground mr-auto">منذ 15 دقيقة</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm font-arabic">طلب إعادة تعيين كلمة مرور</p>
            <span className="text-xs text-muted-foreground mr-auto">منذ 30 دقيقة</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 font-arabic">إعدادات النظام</h3>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold font-arabic">النسخ الاحتياطي</h4>
          <p className="text-sm text-muted-foreground font-arabic mb-3">إنشاء نسخة احتياطية من البيانات</p>
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            إنشاء نسخة احتياطية
          </Button>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold font-arabic">تنظيف النظام</h4>
          <p className="text-sm text-muted-foreground font-arabic mb-3">تنظيف الملفات المؤقتة والسجلات القديمة</p>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            تنظيف النظام
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderReports = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 font-arabic">التقارير والإحصائيات</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <div className="text-center">
            <p className="font-semibold font-arabic">تقرير المستخدمين</p>
            <p className="text-xs text-muted-foreground font-arabic">إحصائيات المستخدمين النشطين</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 text-green-500" />
          <div className="text-center">
            <p className="font-semibold font-arabic">تقرير البلاغات</p>
            <p className="text-xs text-muted-foreground font-arabic">تحليل أنواع وحالات البلاغات</p>
          </div>
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-card/30 border-b border-border/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                <img 
                  src="/lovable-uploads/official-police-logo.png" 
                  alt="Palestinian Police Department Logo" 
                  className="relative w-12 h-12 rounded-full shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold font-arabic bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  لوحة تحكم الإدارة
                </h1>
                <p className="text-sm text-muted-foreground font-arabic">مرحباً، {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <Home className="h-4 w-4 mr-2" />
                الرئيسية
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="relative h-10 w-10 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20"
              >
                <User className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 pb-32">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-1 bg-muted/50">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center gap-1 p-3 h-auto font-arabic"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{section.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {renderOverview()}
      </TabsContent>

      <TabsContent value="user-management" className="space-y-6">
        <Card className="p-1">
        <UserManagementProfessional />
        </Card>
      </TabsContent>

      <TabsContent value="traffic-management" className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-arabic">إدارة شرطة المرور</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/violations-admin')}
            >
              <FileText className="h-8 w-8 text-yellow-500" />
              <div className="text-center">
                <p className="font-semibold font-arabic">إدارة المخالفات</p>
                <p className="text-xs text-muted-foreground font-arabic">تحرير ومراجعة المخالفات</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/vehicle-lookup')}
            >
              <Car className="h-8 w-8 text-blue-500" />
              <div className="text-center">
                <p className="font-semibold font-arabic">البحث عن المركبات</p>
                <p className="text-xs text-muted-foreground font-arabic">استعلام وإدارة بيانات المركبات</p>
              </div>
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="cid-management" className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-arabic">إدارة المباحث الجنائية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/incidents-management')}
            >
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <p className="font-semibold font-arabic">إدارة البلاغات</p>
                <p className="text-xs text-muted-foreground font-arabic">مراجعة وتتبع البلاغات</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/wanted-persons-tree')}
            >
              <Users className="h-8 w-8 text-orange-500" />
              <div className="text-center">
                <p className="font-semibold font-arabic">المطلوبون</p>
                <p className="text-xs text-muted-foreground font-arabic">إدارة قائمة المطلوبين</p>
              </div>
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="special-management" className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-arabic">إدارة الشرطة الخاصة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/tasks')}
            >
              <CheckSquare className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <p className="font-semibold font-arabic">إدارة المهام</p>
                <p className="text-xs text-muted-foreground font-arabic">تكليف ومتابعة المهام</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/patrol')}
            >
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="text-center">
                <p className="font-semibold font-arabic">إدارة الدوريات</p>
                <p className="text-xs text-muted-foreground font-arabic">تنسيق وتتبع الدوريات</p>
              </div>
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="cybercrime-management" className="space-y-6">
        <Card className="p-1">
          <CybercrimeAccessManagement />
        </Card>
      </TabsContent>

          <TabsContent value="user-management" className="space-y-6">
            <Card className="p-1">
              <UserManagementTabbed />
            </Card>
          </TabsContent>

          <TabsContent value="traffic-management" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-arabic">إدارة شرطة المرور</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/violations-admin')}
                >
                  <FileText className="h-8 w-8 text-yellow-500" />
                  <div className="text-center">
                    <p className="font-semibold font-arabic">إدارة المخالفات</p>
                    <p className="text-xs text-muted-foreground font-arabic">تحرير ومراجعة المخالفات</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/vehicle-lookup')}
                >
                  <Car className="h-8 w-8 text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold font-arabic">البحث عن المركبات</p>
                    <p className="text-xs text-muted-foreground font-arabic">استعلام وإدارة بيانات المركبات</p>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cid-management" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-arabic">إدارة المباحث الجنائية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/incidents-management')}
                >
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="text-center">
                    <p className="font-semibold font-arabic">إدارة البلاغات</p>
                    <p className="text-xs text-muted-foreground font-arabic">مراجعة وتتبع البلاغات</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/wanted-persons-tree')}
                >
                  <Users className="h-8 w-8 text-orange-500" />
                  <div className="text-center">
                    <p className="font-semibold font-arabic">المطلوبون</p>
                    <p className="text-xs text-muted-foreground font-arabic">إدارة قائمة المطلوبين</p>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="special-management" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-arabic">إدارة الشرطة الخاصة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/tasks')}
                >
                  <CheckSquare className="h-8 w-8 text-green-500" />
                  <div className="text-center">
                    <p className="font-semibold font-arabic">إدارة المهام</p>
                    <p className="text-xs text-muted-foreground font-arabic">تكليف ومتابعة المهام</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/patrol')}
                >
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold font-arabic">إدارة الدوريات</p>
                    <p className="text-xs text-muted-foreground font-arabic">تنسيق وتتبع الدوريات</p>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cybercrime-management" className="space-y-6">
            <Card className="p-1">
              <CybercrimeAccessManagement />
            </Card>
          </TabsContent>

          <TabsContent value="system-settings" className="space-y-6">
            {renderSystemSettings()}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {renderReports()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;