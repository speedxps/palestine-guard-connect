import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckSquare, Users, Rss, MessageCircle, Activity } from 'lucide-react';

const SpecialPoliceDepartment = () => {
  const navigate = useNavigate();

  const specialPoliceTools = [
    {
      title: 'المهام',
      description: 'إدارة ومتابعة المهام الخاصة',
      icon: CheckSquare,
      path: '/tasks',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'الدوريات',
      description: 'تنسيق وتتبع الدوريات الأمنية',
      icon: Users,
      path: '/patrol',
      color: 'from-green-500 to-green-600'
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
      title: 'المحادثات',
      description: 'التواصل مع الفرق والوحدات',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">الشرطة الخاصة</h1>
          <p className="text-gray-600 font-arabic">العمليات الخاصة والمهام الأمنية</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialPoliceTools.map((tool, index) => {
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