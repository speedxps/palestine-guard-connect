import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Activity, Eye, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function JointOpsMonitoring() {
  const agencies = [
    {
      name: 'الأمن الوقائي',
      activeOps: 3,
      alerts: 1,
      status: 'active',
      performance: 92
    },
    {
      name: 'المخابرات العامة',
      activeOps: 2,
      alerts: 0,
      status: 'active',
      performance: 95
    },
    {
      name: 'قوات الأمن الوطني',
      activeOps: 4,
      alerts: 2,
      status: 'active',
      performance: 88
    },
    {
      name: 'الحرس الرئاسي',
      activeOps: 1,
      alerts: 0,
      status: 'active',
      performance: 98
    },
    {
      name: 'الدفاع المدني',
      activeOps: 2,
      alerts: 1,
      status: 'active',
      performance: 90
    },
    {
      name: 'قوات حماية المنشآت',
      activeOps: 3,
      alerts: 0,
      status: 'active',
      performance: 93
    }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-600';
    if (performance >= 85) return 'text-blue-600';
    if (performance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBar = (performance: number) => {
    let color = 'bg-green-500';
    if (performance < 95) color = 'bg-blue-500';
    if (performance < 85) color = 'bg-yellow-500';
    if (performance < 75) color = 'bg-red-500';
    
    return (
      <div className="w-full bg-muted rounded-full h-2 mt-2">
        <div
          className={`${color} rounded-full h-2 transition-all duration-300`}
          style={{ width: `${performance}%` }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">مراقبة الأنشطة</h1>
          <p className="text-muted-foreground">متابعة وتقييم أنشطة الأجهزة الأمنية المختلفة</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">أجهزة نشطة</p>
                <p className="text-3xl font-bold text-green-600">6</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات جارية</p>
                <p className="text-3xl font-bold text-blue-600">15</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">تنبيهات</p>
                <p className="text-3xl font-bold text-red-600">4</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">متوسط الأداء</p>
                <p className="text-3xl font-bold text-purple-600">92%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>
        </div>

        {/* Agencies Monitoring */}
        <div className="space-y-4">
          {agencies.map((agency, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{agency.name}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>{agency.activeOps} عمليات نشطة</span>
                      </div>
                      {agency.alerts > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 font-semibold">{agency.alerts} تنبيه</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground mb-1">الأداء</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(agency.performance)}`}>
                    {agency.performance}%
                  </p>
                </div>
              </div>
              
              {getPerformanceBar(agency.performance)}
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            الأنشطة الأخيرة
          </h2>
          
          <div className="space-y-3">
            {[
              { time: '19:50', agency: 'الأمن الوقائي', activity: 'بدء عملية أمنية مشتركة', status: 'نشط' },
              { time: '19:40', agency: 'المخابرات العامة', activity: 'تحديث تقرير استخباراتي', status: 'مكتمل' },
              { time: '19:30', agency: 'قوات الأمن الوطني', activity: 'انتشار وحدات أمنية', status: 'نشط' },
              { time: '19:20', agency: 'الدفاع المدني', activity: 'استجابة لحالة طوارئ', status: 'مكتمل' }
            ].map((activity, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'نشط' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className="font-semibold">{activity.agency}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mr-5">{activity.activity}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
