import React from 'react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckSquare,
  Car,
  Shield,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';

const DailyStats = () => {
  const todayStats = {
    totalIncidents: 12,
    resolvedIncidents: 8,
    activeTasks: 15,
    completedTasks: 23,
    trafficViolations: 34,
    cybercrimeReports: 3,
    patrolUnits: 8,
    activeOfficers: 45
  };

  const hourlyData = [
    { hour: '00:00', incidents: 1, tasks: 2 },
    { hour: '02:00', incidents: 0, tasks: 1 },
    { hour: '04:00', incidents: 2, tasks: 3 },
    { hour: '06:00', incidents: 4, tasks: 5 },
    { hour: '08:00', incidents: 3, tasks: 8 },
    { hour: '10:00', incidents: 2, tasks: 6 },
    { hour: '12:00', incidents: 0, tasks: 4 },
    { hour: '14:00', incidents: 0, tasks: 2 },
    { hour: '16:00', incidents: 0, tasks: 0 },
  ];

  const statCards = [
    {
      title: 'البلاغات اليوم',
      value: todayStats.totalIncidents,
      change: '+2',
      icon: AlertTriangle,
      color: 'text-red-500 bg-red-50'
    },
    {
      title: 'البلاغات المحلولة',
      value: todayStats.resolvedIncidents,
      change: '+5',
      icon: CheckSquare,
      color: 'text-green-500 bg-green-50'
    },
    {
      title: 'المهام النشطة',
      value: todayStats.activeTasks,
      change: '-3',
      icon: Clock,
      color: 'text-orange-500 bg-orange-50'
    },
    {
      title: 'المهام المكتملة',
      value: todayStats.completedTasks,
      change: '+8',
      icon: CheckSquare,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      title: 'المخالفات المرورية',
      value: todayStats.trafficViolations,
      change: '+12',
      icon: Car,
      color: 'text-purple-500 bg-purple-50'
    },
    {
      title: 'بلاغات الجرائم الإلكترونية',
      value: todayStats.cybercrimeReports,
      change: '+1',
      icon: Shield,
      color: 'text-indigo-500 bg-indigo-50'
    },
    {
      title: 'وحدات الدورية',
      value: todayStats.patrolUnits,
      change: '0',
      icon: Car,
      color: 'text-gray-500 bg-gray-50'
    },
    {
      title: 'الضباط النشطون',
      value: todayStats.activeOfficers,
      change: '+2',
      icon: Users,
      color: 'text-teal-500 bg-teal-50'
    }
  ];

  return (
    <ProfessionalLayout
      title="الإحصائيات اليومية"
      description="عرض أداء اليوم والإحصائيات التفصيلية"
      showBackButton={true}
      backTo="/dashboard"
      showPrint={true}
      printContent="إحصائيات أداء اليوم"
    >
      <div className="p-6 space-y-6">
        {/* Date Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold font-arabic">
                    {new Date().toLocaleDateString('ar-PS', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground font-arabic">
                    إحصائيات اليوم الحالي - تحديث مباشر
                  </p>
                </div>
              </div>
              <Badge className="font-arabic bg-green-100 text-green-800">
                مُحدث الآن
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.change.startsWith('+');
            const isNeutral = stat.change === '0';
            
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground font-arabic">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp 
                          className={`h-3 w-3 ${
                            isPositive ? 'text-green-500' : 
                            isNeutral ? 'text-gray-500' : 'text-red-500'
                          }`} 
                        />
                        <span 
                          className={`text-xs font-medium ${
                            isPositive ? 'text-green-600' : 
                            isNeutral ? 'text-gray-600' : 'text-red-600'
                          }`}
                        >
                          {stat.change} اليوم
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hourly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              النشاط على مدار اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hourlyData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">
                    {data.hour}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-arabic w-16">
                        بلاغات
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${(data.incidents / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-6">
                        {data.incidents}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-arabic w-16">
                        مهام
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(data.tasks / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-6">
                        {data.tasks}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic text-base">
                ملخص الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">معدل حل البلاغات</span>
                <Badge className="bg-green-100 text-green-800 font-arabic">
                  {Math.round((todayStats.resolvedIncidents / todayStats.totalIncidents) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">معدل إنجاز المهام</span>
                <Badge className="bg-blue-100 text-blue-800 font-arabic">
                  {Math.round((todayStats.completedTasks / (todayStats.completedTasks + todayStats.activeTasks)) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">الضباط النشطون</span>
                <Badge className="bg-teal-100 text-teal-800">
                  {todayStats.activeOfficers}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-arabic text-base">
                التوزيع حسب النوع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">بلاغات الحوادث</span>
                <Badge variant="outline">
                  {todayStats.totalIncidents}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">المخالفات المرورية</span>
                <Badge variant="outline">
                  {todayStats.trafficViolations}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">الجرائم الإلكترونية</span>
                <Badge variant="outline">
                  {todayStats.cybercrimeReports}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProfessionalLayout>
  );
};

export default DailyStats;