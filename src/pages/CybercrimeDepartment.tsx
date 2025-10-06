import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Computer, Shield, FileText, BarChart3, Activity, Users } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const CybercrimeDepartment = () => {
  const navigate = useNavigate();

  const cybercrimeTools = [
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
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
          <Computer className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-arabic">الجرائم الإلكترونية</h1>
          <p className="text-gray-600 font-arabic">مكافحة الجرائم الإلكترونية والأمن السيبراني</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cybercrimeTools.map((tool, index) => {
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
            <CardTitle className="text-2xl font-bold text-red-600">34</CardTitle>
            <CardDescription className="font-arabic">الجرائم الجديدة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">78</CardTitle>
            <CardDescription className="font-arabic">القضايا قيد التحقيق</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">156</CardTitle>
            <CardDescription className="font-arabic">القضايا المحلولة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-600">95%</CardTitle>
            <CardDescription className="font-arabic">معدل النجاح</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CybercrimeDepartment;