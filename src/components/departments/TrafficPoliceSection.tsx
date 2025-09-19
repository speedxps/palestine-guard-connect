import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  FileText, 
  Settings, 
  Search, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const TrafficPoliceSection = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'المخالفات',
      description: 'عرض جميع المخالفات المرورية',
      icon: FileText,
      path: '/violations',
      color: 'from-yellow-500 to-yellow-600',
      stats: '156 جديد'
    },
    {
      title: 'إدارة المخالفات',
      description: 'إدارة ومتابعة المخالفات',
      icon: Settings,
      path: '/violations-admin',
      color: 'from-orange-500 to-orange-600',
      stats: '89 معلق'
    },
    {
      title: 'البحث عن مركبة',
      description: 'البحث في قاعدة بيانات المركبات',
      icon: Search,
      path: '/vehicle-lookup',
      color: 'from-blue-500 to-blue-600',
      stats: ''
    },
    {
      title: 'الدوريات',
      description: 'إدارة الدوريات المرورية',
      icon: Users,
      path: '/patrol',
      color: 'from-green-500 to-green-600',
      stats: '12 نشط'
    }
  ];

  const quickStats = [
    { label: 'المخالفات اليوم', value: '156', icon: FileText, trend: '+23%' },
    { label: 'الدوريات النشطة', value: '12', icon: Users, trend: '+5%' },
    { label: 'المخالفات المحلولة', value: '89', icon: CheckCircle, trend: '+15%' },
    { label: 'المعلقة', value: '67', icon: AlertCircle, trend: '-8%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600">
          <Car className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-arabic">شرطة المرور</h1>
          <p className="text-muted-foreground font-arabic">المخالفات المرورية والمركبات</p>
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

      {/* Service Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

export default TrafficPoliceSection;