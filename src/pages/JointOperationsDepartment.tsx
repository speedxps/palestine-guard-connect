import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Radio, 
  FileText, 
  Shield,
  Phone,
  Database,
  Activity,
  GitBranch
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import jointOpsCover from '@/assets/joint-operations-cover.jpg';

export default function JointOperationsDepartment() {
  const navigate = useNavigate();

  const jointOpsTools = [
    {
      title: 'التنسيق مع الأجهزة',
      description: 'التواصل والتنسيق مع جميع الأجهزة الأمنية',
      icon: GitBranch,
      path: '/department/joint-ops/coordination',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'العمليات المشتركة',
      description: 'إدارة ومتابعة العمليات المشتركة',
      icon: Users,
      path: '/department/joint-ops/operations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'غرفة العمليات',
      description: 'مركز قيادة العمليات والاتصالات',
      icon: Radio,
      path: '/department/joint-ops/command-center',
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'الملفات المشتركة',
      description: 'قاعدة بيانات القضايا والملفات المشتركة',
      icon: Database,
      path: '/department/joint-ops/shared-files',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'التقارير الأمنية',
      description: 'تقارير التنسيق والعمليات المشتركة',
      icon: FileText,
      path: '/reports',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'الاتصالات العاجلة',
      description: 'خطوط الاتصال المباشر مع الأجهزة',
      icon: Phone,
      path: '/department/joint-ops/hotlines',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      title: 'مراقبة الأنشطة',
      description: 'متابعة أنشطة الأجهزة المختلفة',
      icon: Activity,
      path: '/department/joint-ops/monitoring',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      title: 'التدريب المشترك',
      description: 'برامج وتدريبات مشتركة بين الأجهزة',
      icon: Shield,
      path: '/department/joint-ops/training',
      color: 'from-rose-500 to-red-500'
    }
  ];

  const securityAgencies = [
    'الأمن الوقائي',
    'المخابرات العامة',
    'قوات الأمن الوطني',
    'الحرس الرئاسي',
    'الدفاع المدني',
    'قوات حماية المنشآت',
    'الشرطة الخاصة',
    'الشرطة البحرية',
    'الشرطة النسائية',
    'المرور (إدارة السير)',
    'الأمن الدبلوماسي',
    'جهاز الاستخبارات العسكرية'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cover Image */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-b-3xl shadow-2xl">
          <img 
            src={jointOpsCover} 
            alt="غلاف قسم العمليات المشتركة" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-8 right-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
              قسم العمليات المشتركة
            </h1>
            <p className="text-white/90 text-lg md:text-xl mt-2 drop-shadow-lg">
              التنسيق والتواصل مع جميع الأجهزة الأمنية والعسكرية الفلسطينية
            </p>
          </div>
        </div>

        {/* Header with Back Button */}
        <div className="px-4 md:px-8 pt-4">
          <BackButton />
        </div>

        {/* Tools Grid */}
        <div className="px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jointOpsTools.map((tool, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="p-6 space-y-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <tool.icon className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          </div>
        </div>

        {/* Security Agencies Section */}
        <div className="px-4 md:px-8">
          <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            الأجهزة الأمنية المنسقة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityAgencies.map((agency, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">{agency}</span>
              </div>
            ))}
          </div>
        </Card>
        </div>

        {/* Stats Section */}
        <div className="px-4 md:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات نشطة</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">أجهزة منسقة</p>
                <p className="text-3xl font-bold text-green-600">18</p>
              </div>
              <Users className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ملفات مشتركة</p>
                <p className="text-3xl font-bold text-purple-600">45</p>
              </div>
              <Database className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">اتصالات طارئة</p>
                <p className="text-3xl font-bold text-red-600">8</p>
              </div>
              <Phone className="h-10 w-10 text-red-500 opacity-70" />
            </div>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
