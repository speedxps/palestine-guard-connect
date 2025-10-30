import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Computer, Shield, FileText, BarChart3, Activity, Users, Newspaper, MessageCircle, Ticket, Plus } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const CybercrimeDepartment = () => {
  const navigate = useNavigate();

  const cybercrimeTools = [
    {
      title: 'المهام المطلوبة',
      description: 'المهام الموكلة للقسم من الإدارة العامة',
      icon: Shield,
      path: '/department-tasks',
      color: 'from-yellow-500 to-yellow-600',
      highlighted: true
    },
    {
      title: 'بلاغ جديد',
      description: 'إضافة بلاغ جديد للنظام',
      icon: Plus,
      path: '/new-incident',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'الجرائم الإلكترونية',
      description: 'إدارة ومعالجة الجرائم الإلكترونية',
      icon: Shield,
      path: '/cybercrime',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'لوحة الجرائم المتقدمة',
      description: 'لوحة تحكم متقدمة للجرائم الإلكترونية',
      icon: Computer,
      path: '/cybercrime-dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'تقارير الجرائم الإلكترونية',
      description: 'عرض وإدارة تقارير الجرائم',
      icon: FileText,
      path: '/cybercrime-reports',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'التقارير والإحصائيات',
      description: 'تحليلات وإحصائيات شاملة',
      icon: BarChart3,
      path: '/reports',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'لوحة التحكم المتقدمة',
      description: 'أدوات متقدمة لمكافحة الجرائم الإلكترونية',
      icon: Activity,
      path: '/cybercrime-advanced',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'إدارة الوصول الخارجي',
      description: 'رفع وإدارة تطبيق الإداريين خارج فلسطين',
      icon: FileText,
      path: '/external-access-management',
      color: 'from-orange-500 to-orange-600',
      adminOnly: true
    },
    {
      title: 'الأخبار الداخلية',
      description: 'آخر الأخبار والتحديثات',
      icon: Newspaper,
      path: '/internal-news',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'التواصل المشترك',
      description: 'التواصل بين الأقسام',
      icon: MessageCircle,
      path: '/inter-department-communication',
      color: 'from-pink-500 to-rose-600',
      highlighted: true
    },
    {
      title: 'المحادثات',
      description: 'التواصل مع الفريق',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'السجل',
      description: 'آخر الإجراءات والتعديلات',
      icon: Ticket,
      path: '/tickets',
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'مستخدمي القسم',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: Users,
      path: '/department/cybercrime/users',
      color: 'from-rose-500 to-rose-600',
      adminOnly: true
    }
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <BackButton />
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex-shrink-0">
            <Computer className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">الجرائم الإلكترونية</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">مكافحة الجرائم الإلكترونية والأمن السيبراني</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {cybercrimeTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-[120px] sm:min-h-[140px]">
                <Icon className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-primary flex-shrink-0" />
                <p className="text-sm sm:text-base font-semibold text-center line-clamp-2">{tool.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">34</CardTitle>
            <CardDescription className="text-xs sm:text-sm">الجرائم الجديدة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-blue-600">78</CardTitle>
            <CardDescription className="text-xs sm:text-sm">القضايا قيد التحقيق</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-600">156</CardTitle>
            <CardDescription className="text-xs sm:text-sm">القضايا المحلولة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-purple-600">95%</CardTitle>
            <CardDescription className="text-xs sm:text-sm">معدل النجاح</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CybercrimeDepartment;