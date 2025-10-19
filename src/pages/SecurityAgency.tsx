import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { Shield, Phone, Users, FileText, Activity, Database } from 'lucide-react';

const agencyData: Record<string, { name: string; description: string; color: string }> = {
  'preventive-security': {
    name: 'الأمن الوقائي',
    description: 'مسؤول عن الأمن الداخلي والوقاية من التهديدات الأمنية',
    color: 'from-blue-600 to-blue-800'
  },
  'general-intelligence': {
    name: 'المخابرات العامة',
    description: 'جمع وتحليل المعلومات الاستخباراتية',
    color: 'from-gray-700 to-gray-900'
  },
  'national-security': {
    name: 'قوات الأمن الوطني',
    description: 'حفظ الأمن والنظام العام',
    color: 'from-green-600 to-green-800'
  },
  'presidential-guard': {
    name: 'الحرس الرئاسي',
    description: 'حماية المؤسسات الرئاسية والقيادات',
    color: 'from-red-600 to-red-800'
  },
  'civil-defense': {
    name: 'الدفاع المدني',
    description: 'الإنقاذ والإطفاء والحماية المدنية',
    color: 'from-orange-600 to-orange-800'
  },
  'facility-protection': {
    name: 'قوات حماية المنشآت',
    description: 'حماية المنشآت الحيوية والاستراتيجية',
    color: 'from-purple-600 to-purple-800'
  },
  'special-police': {
    name: 'الشرطة الخاصة',
    description: 'عمليات خاصة وتدخل سريع',
    color: 'from-indigo-600 to-indigo-800'
  },
  'marine-police': {
    name: 'الشرطة البحرية',
    description: 'الأمن البحري وحماية الشواطئ',
    color: 'from-cyan-600 to-cyan-800'
  },
  'women-police': {
    name: 'الشرطة النسائية',
    description: 'قضايا المرأة والأسرة والطفل',
    color: 'from-pink-600 to-pink-800'
  },
  'traffic': {
    name: 'المرور (إدارة السير)',
    description: 'تنظيم وإدارة حركة المرور',
    color: 'from-yellow-600 to-yellow-800'
  },
  'diplomatic-security': {
    name: 'الأمن الدبلوماسي',
    description: 'حماية البعثات الدبلوماسية والدبلوماسيين',
    color: 'from-teal-600 to-teal-800'
  },
  'military-intelligence': {
    name: 'جهاز الاستخبارات العسكرية',
    description: 'الاستخبارات العسكرية والأمن العسكري',
    color: 'from-slate-700 to-slate-900'
  }
};

export default function SecurityAgency() {
  const { agencyId } = useParams();
  const agency = agencyId ? agencyData[agencyId] : null;

  if (!agency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <BackButton />
        <div className="text-center mt-20">
          <h1 className="text-2xl font-bold text-foreground">الجهاز غير موجود</h1>
        </div>
      </div>
    );
  }

  const features = [
    {
      title: 'التنسيق المباشر',
      description: 'قناة اتصال مباشرة مع العمليات المشتركة',
      icon: Phone,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'الملفات المشتركة',
      description: 'الوصول إلى قاعدة البيانات المشتركة',
      icon: Database,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'العمليات الجارية',
      description: 'متابعة العمليات المشتركة النشطة',
      icon: Activity,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'الموارد البشرية',
      description: 'معلومات الضباط والموظفين',
      icon: Users,
      color: 'from-amber-500 to-yellow-500'
    },
    {
      title: 'التقارير والوثائق',
      description: 'إنشاء ومراجعة التقارير',
      icon: FileText,
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'الأمن والحماية',
      description: 'بروتوكولات الأمن والسلامة',
      icon: Shield,
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with gradient background */}
        <div className={`relative w-full h-[250px] rounded-b-3xl shadow-2xl bg-gradient-to-br ${agency.color} overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-8 right-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl">
              {agency.name}
            </h1>
            <p className="text-white/90 text-lg mt-2 drop-shadow-lg">
              {agency.description}
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="px-4 md:px-8">
          <BackButton />
        </div>

        {/* Features Grid */}
        <div className="px-4 md:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 hover:border-primary/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="p-6 space-y-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 md:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">عمليات مشتركة</p>
                  <p className="text-3xl font-bold text-blue-600">8</p>
                </div>
                <Activity className="h-10 w-10 text-blue-500 opacity-70" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ملفات مشتركة</p>
                  <p className="text-3xl font-bold text-green-600">24</p>
                </div>
                <Database className="h-10 w-10 text-green-500 opacity-70" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">اتصالات نشطة</p>
                  <p className="text-3xl font-bold text-purple-600">5</p>
                </div>
                <Phone className="h-10 w-10 text-purple-500 opacity-70" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
