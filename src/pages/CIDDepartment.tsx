import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Plus, Users, Eye, Settings, Microscope, Newspaper, MessageCircle, Ticket, FolderOpen } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const CIDDepartment = () => {
  const navigate = useNavigate();

  const cidTools = [
    {
      title: 'البلاغات',
      description: 'عرض ومتابعة البلاغات الواردة',
      icon: AlertTriangle,
      path: '/incidents',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'إدارة البلاغات',
      description: 'تعديل وتوزيع البلاغات',
      icon: Settings,
      path: '/incidents-management',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'بلاغ جديد',
      description: 'إضافة بلاغ جديد للنظام',
      icon: Plus,
      path: '/new-incident',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'المطلوبون',
      description: 'قائمة الأشخاص المطلوبين',
      icon: Users,
      path: '/wanted-persons-tree',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'التعرف على الوجوه',
      description: 'نظام التعرف الذكي على الوجوه',
      icon: Eye,
      path: '/face-recognition',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'المختبرات والأدلة الجنائية',
      description: 'إدارة الأدلة الجنائية وتقارير المختبرات',
      icon: Microscope,
      path: '/forensic-labs',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'سجل المشتبهين والمتهمين',
      description: 'إدارة ملفات المشتبهين والتحقيقات',
      icon: FolderOpen,
      path: '/department/cid/suspect-search',
      color: 'from-rose-500 to-rose-600'
    },
    {
      title: 'الأخبار الداخلية',
      description: 'آخر الأخبار والتحديثات',
      icon: Newspaper,
      path: '/internal-news',
      color: 'from-teal-500 to-teal-600'
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
      title: 'مستخدمي القسم',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: Users,
      path: '/department/cid/users',
      color: 'from-pink-500 to-pink-600',
      adminOnly: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">المباحث الجنائية</h1>
          <p className="text-gray-600 font-arabic">التحقيق في الجرائم ومعالجة البلاغات</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {cidTools.map((tool, index) => {
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
            <CardTitle className="text-2xl font-bold text-red-600">87</CardTitle>
            <CardDescription className="font-arabic">البلاغات الجديدة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">156</CardTitle>
            <CardDescription className="font-arabic">البلاغات قيد التحقيق</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">432</CardTitle>
            <CardDescription className="font-arabic">البلاغات المحلولة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-orange-600">23</CardTitle>
            <CardDescription className="font-arabic">الأشخاص المطلوبون</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CIDDepartment;