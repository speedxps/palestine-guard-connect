import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Computer, 
  Shield, 
  FileText, 
  BarChart3,
  AlertTriangle,
  Lock,
  Eye,
  TrendingUp
} from 'lucide-react';

const CybercrimeSection = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'الجرائم الإلكترونية',
      description: 'التحقيق في الجرائم السيبرانية',
      icon: Shield,
      path: '/cybercrime',
      color: 'from-indigo-500 to-indigo-600',
      stats: '34 قضية'
    },
    {
      title: 'تقارير الجرائم الإلكترونية',
      description: 'تقارير تفصيلية عن القضايا',
      icon: FileText,
      path: '/cybercrime-reports',
      color: 'from-purple-500 to-purple-600',
      stats: '89 تقرير'
    },
    {
      title: 'التقارير الإحصائية',
      description: 'إحصائيات وتحليلات الجرائم',
      icon: BarChart3,
      path: '/reports',
      color: 'from-blue-500 to-blue-600',
      stats: '12 تحليل'
    }
  ];

  const quickStats = [
    { label: 'القضايا النشطة', value: '34', icon: AlertTriangle, trend: '+15%' },
    { label: 'تم الحل هذا الشهر', value: '89', icon: Lock, trend: '+22%' },
    { label: 'قيد التحقيق', value: '12', icon: Eye, trend: '-5%' },
    { label: 'معدل الحل', value: '78%', icon: TrendingUp, trend: '+8%' }
  ];

  const threatLevels = [
    { level: 'عالي', count: 5, color: 'bg-red-500' },
    { level: 'متوسط', count: 15, color: 'bg-yellow-500' },
    { level: 'منخفض', count: 14, color: 'bg-green-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
          <Computer className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-arabic">قسم الجرائم الإلكترونية</h1>
          <p className="text-muted-foreground font-arabic">مكافحة الجرائم السيبرانية والأمن الرقمي</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="rounded-lg sm:rounded-xl">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground font-arabic">{stat.label}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold break-words">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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

      {/* Threat Level Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-arabic">مستويات التهديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {threatLevels.map((threat, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${threat.color} flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium font-arabic text-sm">{threat.level}</p>
                  <p className="text-xs text-muted-foreground">{threat.count} قضية</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

export default CybercrimeSection;