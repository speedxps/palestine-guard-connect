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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">الشرطة الخاصة</h1>
          <p className="text-gray-600 font-arabic">العمليات الخاصة والمهام الأمنية</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {specialPoliceTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
                <Icon className="h-12 w-12 mb-4 text-primary" />
                <p className="text-sm md:text-base font-semibold text-center">{tool.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">45</CardTitle>
            <CardDescription className="font-arabic">المهام النشطة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">8</CardTitle>
            <CardDescription className="font-arabic">الدوريات الميدانية</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-600">156</CardTitle>
            <CardDescription className="font-arabic">المهام المكتملة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-orange-600">24/7</CardTitle>
            <CardDescription className="font-arabic">التغطية الأمنية</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default SpecialPoliceDepartment;