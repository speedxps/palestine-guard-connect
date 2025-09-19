import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Settings, Users, FileText, Database, Shield } from 'lucide-react';

const AdminDepartment = () => {
  const navigate = useNavigate();

  const adminTools = [
    {
      title: 'إدارة المستخدمين',
      description: 'إضافة وتعديل وحذف المستخدمين',
      icon: Users,
      path: '/admin-panel',
      color: 'from-blue-500 to-blue-600'
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
      title: 'إعدادات النظام',
      description: 'إعدادات النظام والصلاحيات',
      icon: Settings,
      path: '/admin-panel',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">الإدارة العامة</h1>
          <p className="text-gray-600 font-arabic">أدوات الإدارة والتحكم في النظام</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool, index) => {
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