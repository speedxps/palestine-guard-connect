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
        path: '/joint-ops/agency-communications',
        color: 'from-blue-500 to-cyan-500'
      },
    {
      title: 'العمليات المشتركة',
      description: 'إدارة ومتابعة العمليات المشتركة',
      icon: Users,
      path: '/joint-ops/operations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'غرفة العمليات',
      description: 'مركز قيادة العمليات والاتصالات',
      icon: Radio,
      path: '/joint-ops/command-center',
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'الملفات المشتركة',
      description: 'قاعدة بيانات القضايا والملفات المشتركة',
      icon: Database,
      path: '/joint-ops/shared-files',
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
      path: '/joint-ops/hotlines',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      title: 'مراقبة الأنشطة',
      description: 'متابعة أنشطة الأجهزة المختلفة',
      icon: Activity,
      path: '/joint-ops/monitoring',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      title: 'التدريب المشترك',
      description: 'برامج وتدريبات مشتركة بين الأجهزة',
      icon: Shield,
      path: '/joint-ops/training',
      color: 'from-rose-500 to-red-500'
    }
  ];

  const securityAgencies = [
    { name: 'الأمن الوقائي', id: 'preventive-security' },
    { name: 'المخابرات العامة', id: 'general-intelligence' },
    { name: 'قوات الأمن الوطني', id: 'national-security' },
    { name: 'الحرس الرئاسي', id: 'presidential-guard' },
    { name: 'الدفاع المدني', id: 'civil-defense' },
    { name: 'قوات حماية المنشآت', id: 'facility-protection' },
    { name: 'الشرطة الخاصة', id: 'special-police' },
    { name: 'الشرطة البحرية', id: 'marine-police' },
    { name: 'الشرطة النسائية', id: 'women-police' },
    { name: 'المرور (إدارة السير)', id: 'traffic' },
    { name: 'الأمن الدبلوماسي', id: 'diplomatic-security' },
    { name: 'جهاز الاستخبارات العسكرية', id: 'military-intelligence' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Cover Image */}
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden rounded-b-2xl sm:rounded-b-3xl shadow-2xl">
          <img 
            src={jointOpsCover} 
            alt="غلاف قسم العمليات المشتركة" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 left-4 sm:left-6">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl">
              قسم العمليات المشتركة
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mt-1 sm:mt-2 drop-shadow-lg">
              التنسيق والتواصل مع جميع الأجهزة الأمنية والعسكرية الفلسطينية
            </p>
          </div>
        </div>

        {/* Header with Back Button */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4">
          <BackButton />
        </div>

        {/* Tools Grid */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {jointOpsTools.map((tool, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <div className="p-2 sm:p-3 md:p-4 flex flex-col items-center text-center min-h-[80px] sm:min-h-[90px] md:min-h-[100px]">
                <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary mb-2 flex-shrink-0" />
                <h3 className="text-[10px] sm:text-xs md:text-sm font-bold line-clamp-2">
                  {tool.title}
                </h3>
              </div>
            </Card>
          ))}
          </div>
        </div>

        {/* Security Agencies Section */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            الأجهزة الأمنية المنسقة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {securityAgencies.map((agency, index) => (
              <div
                key={index}
                onClick={() => navigate(`/security-agency/${agency.id}`)}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium line-clamp-1">{agency.name}</span>
              </div>
            ))}
          </div>
        </Card>
        </div>

        {/* Stats Section */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">عمليات نشطة</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">12</p>
              </div>
              <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">أجهزة منسقة</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">18</p>
              </div>
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">ملفات مشتركة</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">45</p>
              </div>
              <Database className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">اتصالات طارئة</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">8</p>
              </div>
              <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
