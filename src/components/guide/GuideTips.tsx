import React from 'react';
import { Lightbulb, Zap, Lock, MapPin, Save, Bot, Clock, Shield, Target, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const GuideTips: React.FC = () => {
  const tips = [
    {
      icon: Lightbulb,
      tip: "استخدم البحث السريع (Ctrl+K) للوصول لأي صفحة",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      tip: "فعّل الإشعارات لتلقي التنبيهات الفورية للحوادث والطوارئ",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Lock,
      tip: "غيّر كلمة المرور كل 3 أشهر لحماية حسابك من الاختراق",
      color: "from-red-500 to-red-600"
    },
    {
      icon: MapPin,
      tip: "فعّل الموقع GPS قبل بدء الدورية للتتبع الدقيق",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Save,
      tip: "احفظ عملك بشكل دوري لتجنب فقدان البيانات عند انقطاع الإنترنت",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Bot,
      tip: "استخدم المساعد الذكي للإجابة على أي سؤال بدلاً من البحث يدوياً",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Clock,
      tip: "راجع سجل النشاط يومياً لمتابعة إنجازاتك ومهامك",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      tip: "فعّل المصادقة الثنائية (2FA) لحماية إضافية لحسابك",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Target,
      tip: "خصص لوحة التحكم لعرض الإحصائيات الأكثر أهمية لك",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Wifi,
      tip: "حمّل البيانات المهمة عند وجود إنترنت قوي للعمل بدون اتصال لاحقاً",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Lightbulb className="h-8 w-8" />
          نصائح وإرشادات سريعة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tips.map((tip, index) => {
            const TipIcon = tip.icon;
            return (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className={`bg-gradient-to-br ${tip.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-300`}>
                    <TipIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium flex-1 pt-2">
                    {tip.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
