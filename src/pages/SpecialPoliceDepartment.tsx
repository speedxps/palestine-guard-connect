import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckSquare, Users, Rss, MessageCircle, Activity, Newspaper, Ticket, Plus } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const SpecialPoliceDepartment = () => {
  const navigate = useNavigate();

  const specialPoliceTools = [
    {
      title: 'المهام المطلوبة',
      description: 'المهام الموكلة للقسم من الإدارة العامة',
      icon: CheckSquare,
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
      title: 'الدوريات',
      description: 'تنسيق وتتبع الدوريات الأمنية',
      icon: Users,
      path: '/patrol',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'الدوريات القديمة',
      description: 'عرض سجل الدوريات السابقة',
      icon: Activity,
      path: '/patrol-old',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'التغذية',
      description: 'التحديثات والأخبار العملياتية',
      icon: Rss,
      path: '/feed',
      color: 'from-orange-500 to-orange-600'
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
      description: 'التواصل مع الفرق والوحدات',
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
      path: '/department/special/users',
      color: 'from-indigo-500 to-indigo-600',
      adminOnly: true
    }
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <BackButton />
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex-shrink-0">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">الشرطة الخاصة</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">العمليات الخاصة والمهام الأمنية</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {specialPoliceTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <CardContent className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 min-h-[80px] sm:min-h-[90px] md:min-h-[100px]">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-2 text-primary flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-center line-clamp-2">{tool.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-blue-600">45</CardTitle>
            <CardDescription className="text-xs sm:text-sm">المهام النشطة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-600">8</CardTitle>
            <CardDescription className="text-xs sm:text-sm">الدوريات الميدانية</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-purple-600">156</CardTitle>
            <CardDescription className="text-xs sm:text-sm">المهام المكتملة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center p-3 sm:p-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-orange-600">24/7</CardTitle>
            <CardDescription className="text-xs sm:text-sm">التغطية الأمنية</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default SpecialPoliceDepartment;