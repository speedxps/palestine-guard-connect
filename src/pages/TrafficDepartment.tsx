import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Car, FileText, Settings, Users, Search, Activity } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const TrafficDepartment = () => {
  const navigate = useNavigate();

  const trafficTools = [
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
      title: 'مستخدمي القسم',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: Users,
      path: '/department/traffic/users',
      color: 'from-indigo-500 to-indigo-600',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trafficTools.map((tool, index) => {
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