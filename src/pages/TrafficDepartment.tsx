import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Car, FileText, Settings, Users, Search, Activity, Newspaper, MessageCircle, Ticket, FolderOpen } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const TrafficDepartment = () => {
  const navigate = useNavigate();

  const trafficTools = [
    {
      title: 'المهام المطلوبة',
      description: 'المهام الموكلة للقسم من الإدارة العامة',
      icon: FileText,
      path: '/department-tasks',
      color: 'from-yellow-500 to-yellow-600',
      highlighted: true
    },
    {
      title: 'المخالفات',
      description: 'عرض وإدارة مخالفات المرور',
      icon: FileText,
      path: '/violations',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'إدارة المخالفات',
      description: 'إضافة وتعديل المخالفات',
      icon: Settings,
      path: '/violations-admin',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'الإستعلام عن المركبات',
      description: 'البحث في سجلات المركبات',
      icon: Search,
      path: '/vehicle-inquiry',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'إدارة المركبات',
      description: 'إدارة سجلات المركبات والملاك',
      icon: Car,
      path: '/vehicle-management',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'الدوريات',
      description: 'تنسيق وتتبع دوريات المرور',
      icon: Users,
      path: '/patrol',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'إدارة الدوريات',
      description: 'تنظيم الدوريات وتوزيع المهام',
      icon: Activity,
      path: '/patrols-management',
      color: 'from-teal-500 to-teal-600'
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
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'سجل المواطنين المركزي',
      description: 'إدارة سجلات المواطنين ومركباتهم',
      icon: FolderOpen,
      path: '/department/traffic/citizen-search',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'مستخدمي القسم',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: Users,
      path: '/department/traffic/users',
      color: 'from-pink-500 to-pink-600',
      adminOnly: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
          <Car className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">شرطة المرور</h1>
          <p className="text-gray-600 font-arabic">إدارة حركة المرور والمخالفات</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {trafficTools.map((tool, index) => {
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
            <CardTitle className="text-2xl font-bold text-red-600">1,245</CardTitle>
            <CardDescription className="font-arabic">المخالفات هذا الشهر</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">856</CardTitle>
            <CardDescription className="font-arabic">المخالفات المسددة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">12</CardTitle>
            <CardDescription className="font-arabic">الدوريات النشطة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-600">45,832</CardTitle>
            <CardDescription className="font-arabic">إجمالي المركبات</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default TrafficDepartment;