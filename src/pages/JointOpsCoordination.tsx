import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { GitBranch, Phone, FileText, Calendar, Users, AlertCircle } from 'lucide-react';

export default function JointOpsCoordination() {
  const agencies = [
    'الأمن الوقائي',
    'المخابرات العامة',
    'قوات الأمن الوطني',
    'الحرس الرئاسي',
    'الدفاع المدني',
    'قوات حماية المنشآت'
  ];

  const coordinationTypes = [
    {
      title: 'تنسيق العمليات',
      description: 'تنسيق العمليات الأمنية المشتركة',
      icon: GitBranch,
      color: 'from-blue-500 to-cyan-500',
      count: 12
    },
    {
      title: 'الاتصالات الطارئة',
      description: 'خطوط الاتصال المباشر',
      icon: Phone,
      color: 'from-red-500 to-orange-500',
      count: 5
    },
    {
      title: 'تبادل المعلومات',
      description: 'مشاركة البيانات والتقارير',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      count: 28
    },
    {
      title: 'الاجتماعات المشتركة',
      description: 'جدول الاجتماعات الدورية',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      count: 3
    },
    {
      title: 'فرق العمل',
      description: 'فرق العمل المشتركة',
      icon: Users,
      color: 'from-amber-500 to-yellow-500',
      count: 8
    },
    {
      title: 'التنبيهات الأمنية',
      description: 'التنبيهات العاجلة المشتركة',
      icon: AlertCircle,
      color: 'from-indigo-500 to-blue-500',
      count: 2
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">التنسيق مع الأجهزة</h1>
          <p className="text-muted-foreground">إدارة التنسيق والتواصل مع جميع الأجهزة الأمنية</p>
        </div>

        {/* Coordination Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coordinationTypes.map((type, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg`}>
                    <type.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{type.count}</div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-1">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Agencies List */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            الأجهزة المنسقة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agencies.map((agency, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">{agency}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
