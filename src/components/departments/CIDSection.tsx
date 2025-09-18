import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Eye, 
  Plus, 
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

const CIDSection = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'البلاغات',
      description: 'عرض جميع البلاغات الواردة',
      icon: AlertTriangle,
      path: '/incidents',
      color: 'from-red-500 to-red-600',
      stats: '24 جديد'
    },
    {
      title: 'إدارة البلاغات',
      description: 'إدارة ومتابعة البلاغات',
      icon: FileText,
      path: '/incidents-management',
      color: 'from-orange-500 to-orange-600',
      stats: '18 نشط'
    },
    {
      title: 'بلاغ جديد',
      description: 'إنشاء بلاغ جديد',
      icon: Plus,
      path: '/new-incident',
      color: 'from-green-500 to-green-600',
      stats: ''
    },
    {
      title: 'المطلوبون',
      description: 'قائمة الأشخاص المطلوبين',
      icon: Users,
      path: '/wanted-persons-tree',
      color: 'from-purple-500 to-purple-600',
      stats: '142 شخص'
    },
    {
      title: 'التعرف على الوجوه',
      description: 'نظام التعرف على الوجوه',
      icon: Eye,
      path: '/face-recognition',
      color: 'from-blue-500 to-blue-600',
      stats: 'متاح'
    }
  ];

  const quickStats = [
    { label: 'البلاغات الجديدة', value: '24', icon: AlertTriangle, trend: '+12%' },
    { label: 'قيد التحقيق', value: '18', icon: Clock, trend: '-5%' },
    { label: 'تم الحل', value: '156', icon: TrendingUp, trend: '+8%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-arabic">المباحث الجنائية</h1>
          <p className="text-muted-foreground font-arabic">البلاغات والتحقيقات الجنائية</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="h-5 w-5 text-primary" />
                    <Badge variant={stat.trend.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Service Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.path}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate(section.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {section.stats && (
                    <Badge variant="secondary" className="font-arabic">
                      {section.stats}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg font-arabic">{section.title}</h3>
                  <p className="text-sm text-muted-foreground font-arabic">
                    {section.description}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full font-arabic"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  الدخول للقسم
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CIDSection;