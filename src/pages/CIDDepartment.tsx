import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Plus, Users, Eye, Settings } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cidTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className={`mx-auto p-4 rounded-full bg-gradient-to-r ${tool.color} w-fit group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="font-arabic text-xl">{tool.title}</CardTitle>
                <CardDescription className="font-arabic text-gray-600">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(tool.path)}
                  className="w-full font-arabic"
                  variant="outline"
                >
                  الدخول للقسم
                </Button>
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