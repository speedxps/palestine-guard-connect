import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Shield, Users, Calendar, Target, Award, TrendingUp } from 'lucide-react';

export default function JointOpsTraining() {
  const trainings = [
    {
      name: 'تدريب مشترك على مكافحة الإرهاب',
      agencies: ['الأمن الوقائي', 'قوات الأمن الوطني', 'الشرطة الخاصة'],
      date: '2025-11-05',
      duration: '5 أيام',
      participants: 45,
      status: 'upcoming'
    },
    {
      name: 'ورشة التنسيق الأمني المتقدم',
      agencies: ['المخابرات العامة', 'الأمن الوقائي'],
      date: '2025-10-25',
      duration: '3 أيام',
      participants: 30,
      status: 'active'
    },
    {
      name: 'تمرين الاستجابة للطوارئ',
      agencies: ['الدفاع المدني', 'قوات حماية المنشآت'],
      date: '2025-10-15',
      duration: '2 أيام',
      participants: 38,
      status: 'completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">قادم</span>;
      case 'active':
        return <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">نشط</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">مكتمل</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">التدريب المشترك</h1>
          <p className="text-muted-foreground">برامج التدريب والتطوير المشترك بين الأجهزة الأمنية</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">برامج نشطة</p>
                <p className="text-3xl font-bold text-blue-600">1</p>
              </div>
              <Shield className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">برامج قادمة</p>
                <p className="text-3xl font-bold text-green-600">1</p>
              </div>
              <Calendar className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي المشاركين</p>
                <p className="text-3xl font-bold text-purple-600">113</p>
              </div>
              <Users className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">معدل النجاح</p>
                <p className="text-3xl font-bold text-amber-600">94%</p>
              </div>
              <Award className="h-10 w-10 text-amber-500 opacity-70" />
            </div>
          </Card>
        </div>

        {/* Training Programs */}
        <div className="space-y-4">
          {trainings.map((training, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{training.name}</h3>
                    {getStatusBadge(training.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">التاريخ:</span>
                      <span className="font-semibold">{new Date(training.date).toLocaleDateString('ar-EG')}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold">{training.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">عدد المشاركين:</span>
                      <span className="font-semibold">{training.participants} متدرب</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">الأجهزة المشاركة:</p>
                <div className="flex flex-wrap gap-2">
                  {training.agencies.map((agency, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                    >
                      {agency}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Training Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">التدريب التكتيكي</h3>
                <p className="text-sm text-muted-foreground">8 برامج</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">التنسيق المشترك</h3>
                <p className="text-sm text-muted-foreground">5 برامج</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">التطوير المهني</h3>
                <p className="text-sm text-muted-foreground">6 برامج</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
