import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Phone, PhoneCall, PhoneForwarded, Clock } from 'lucide-react';

export default function JointOpsHotlines() {
  const hotlines = [
    {
      name: 'الخط الساخن - القيادة العامة',
      number: '100',
      status: 'available',
      agency: 'القيادة العامة',
      description: 'اتصال مباشر مع القيادة العليا'
    },
    {
      name: 'خط الطوارئ - الأمن الوقائي',
      number: '101',
      status: 'available',
      agency: 'الأمن الوقائي',
      description: 'للحالات الطارئة فقط'
    },
    {
      name: 'التنسيق - المخابرات العامة',
      number: '102',
      status: 'busy',
      agency: 'المخابرات العامة',
      description: 'خط التنسيق المباشر'
    },
    {
      name: 'العمليات - قوات الأمن الوطني',
      number: '103',
      status: 'available',
      agency: 'قوات الأمن الوطني',
      description: 'غرفة عمليات الأمن الوطني'
    },
    {
      name: 'الحرس الرئاسي',
      number: '104',
      status: 'available',
      agency: 'الحرس الرئاسي',
      description: 'التنسيق الأمني الرئاسي'
    },
    {
      name: 'الدفاع المدني - الطوارئ',
      number: '105',
      status: 'available',
      agency: 'الدفاع المدني',
      description: 'خط الطوارئ والإنقاذ'
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'available') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-green-600">متاح</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm font-semibold text-yellow-600">مشغول</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">الاتصالات العاجلة</h1>
          <p className="text-muted-foreground">خطوط الاتصال المباشر مع جميع الأجهزة الأمنية</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">خطوط متاحة</p>
                <p className="text-3xl font-bold text-green-600">5</p>
              </div>
              <Phone className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">خطوط مشغولة</p>
                <p className="text-3xl font-bold text-yellow-600">1</p>
              </div>
              <PhoneCall className="h-10 w-10 text-yellow-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">مكالمات اليوم</p>
                <p className="text-3xl font-bold text-blue-600">28</p>
              </div>
              <PhoneForwarded className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>
        </div>

        {/* Hotlines List */}
        <div className="space-y-4">
          {hotlines.map((hotline, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{hotline.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{hotline.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">الجهاز:</span>
                        <span className="text-sm font-semibold">{hotline.agency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">الرقم:</span>
                        <span className="text-2xl font-bold text-primary">{hotline.number}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {getStatusBadge(hotline.status)}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call History */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            سجل المكالمات الأخيرة
          </h2>
          
          <div className="space-y-3">
            {[
              { time: '19:45', agency: 'الأمن الوقائي', duration: '5 دقائق', type: 'طارئ' },
              { time: '19:30', agency: 'المخابرات العامة', duration: '12 دقيقة', type: 'تنسيق' },
              { time: '19:15', agency: 'قوات الأمن الوطني', duration: '8 دقائق', type: 'عملياتي' }
            ].map((call, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">{call.agency}</p>
                  <p className="text-sm text-muted-foreground">{call.type}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{call.time}</p>
                  <p className="text-xs text-muted-foreground">{call.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
