import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Settings, Users, FileText, Database, Shield, Ticket, MessageCircle, Newspaper } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DepartmentIcon } from '@/components/DepartmentIcon';

const AdminDepartment = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();

  const adminTools = [
    {
      title: 'توزيع المهام والدوريات',
      description: 'إنشاء وتوزيع المهام على الأقسام والموظفين',
      icon: FileText,
      path: '/tasks',
      color: 'from-yellow-500 to-yellow-600',
      highlighted: true
    },
    {
      title: 'إدارة المستخدمين',
      description: 'إضافة وتعديل وحذف المستخدمين',
      icon: Users,
      path: '/admin-panel',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'طلبات إغلاق التحقيقات',
      description: 'مراجعة والموافقة على طلبات الإغلاق',
      icon: FileText,
      path: '/investigation-closure-management',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'إدارة الإشعارات',
      description: 'إرسال إشعارات للأقسام والمستخدمين',
      icon: Shield,
      path: '/notification-management',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'النسخ الاحتياطي',
      description: 'نسخ احتياطي للبيانات والاستعادة',
      icon: Database,
      path: '/backup',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'سجل المواطنين',
      description: 'إدارة سجلات المواطنين',
      icon: FileText,
      path: '/citizen-records',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'صلاحيات المستخدم',
      description: 'إدارة صلاحيات وحالات المستخدمين',
      icon: Settings,
      path: '/user-permissions',
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'الأخبار الداخلية',
      description: 'آخر الأخبار والتحديثات',
      icon: Newspaper,
      path: '/internal-news',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'المحادثات',
      description: 'التواصل مع الفريق',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'السجل',
      description: 'آخر الإجراءات والتعديلات',
      icon: Ticket,
      path: '/tickets',
      color: 'from-amber-500 to-amber-600',
      stats: `${stats.adminTickets} Tickets`
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <DepartmentIcon 
          icon={Crown}
          gradient="from-yellow-400 via-yellow-500 to-yellow-600"
          size="xl"
          animated={true}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">الإدارة العامة</h1>
          <p className="text-gray-600 font-arabic">أدوات الإدارة والتحكم في النظام</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {adminTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={index} 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative"
              onClick={() => navigate(tool.path)}
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="relative flex flex-col items-center justify-center p-6 md:p-8">
                <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  <DepartmentIcon 
                    icon={Icon}
                    gradient={tool.color}
                    size="lg"
                    animated={true}
                  />
                </div>
                <p className="text-sm md:text-base font-bold text-center font-arabic group-hover:text-primary transition-colors duration-300">
                  {tool.title}
                </p>
                {tool.stats && (
                  <p className="text-xs text-muted-foreground mt-1 font-arabic">
                    {tool.stats}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">150+</CardTitle>
            <CardDescription className="font-arabic">إجمالي المستخدمين</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">5</CardTitle>
            <CardDescription className="font-arabic">الأقسام النشطة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-600">99.9%</CardTitle>
            <CardDescription className="font-arabic">وقت تشغيل النظام</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminDepartment;