import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  MapPin, 
  Users, 
  FileText, 
  AlertTriangle,
  Camera,
  Search,
  Database,
  TrendingUp
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function BordersDepartment() {
  const navigate = useNavigate();

  const bordersTools = [
    {
      title: 'مراقبة المعابر',
      description: 'مراقبة حركة الدخول والخروج من جميع المعابر',
      icon: Camera,
      path: '/department/borders/monitoring',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'قاعدة بيانات العبور',
      description: 'سجلات الدخول والخروج والتصاريح',
      icon: Database,
      path: '/department/borders/database',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'البحث والاستعلام',
      description: 'البحث في سجلات المسافرين والعابرين',
      icon: Search,
      path: '/citizen-records',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'البلاغات الحدودية',
      description: 'إدارة البلاغات المتعلقة بالمعابر',
      icon: AlertTriangle,
      path: '/incidents',
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'إدارة التصاريح',
      description: 'إصدار ومتابعة تصاريح العبور',
      icon: FileText,
      path: '/department/borders/permits',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'إحصائيات العبور',
      description: 'تحليل حركة المرور عبر المعابر',
      icon: TrendingUp,
      path: '/reports',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      title: 'الأشخاص المطلوبون',
      description: 'قائمة المطلوبين والممنوعين من السفر',
      icon: Users,
      path: '/wanted-persons',
      color: 'from-rose-500 to-red-500'
    },
    {
      title: 'خريطة المعابر',
      description: 'عرض مواقع المعابر والحالة الأمنية',
      icon: MapPin,
      path: '/department/borders/map',
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <BackButton />
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                قسم المعابر والحدود
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground sm:mr-14">
              مراقبة وإدارة حركة الدخول والخروج من المعابر والتنسيق الأمني
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {bordersTools.map((tool, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <div className="p-4 flex flex-col items-center text-center min-h-[100px]">
                <tool.icon className="h-8 w-8 text-primary mb-2 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold line-clamp-2">
                  {tool.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">عمليات عبور اليوم</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">1,247</p>
              </div>
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">المعابر النشطة</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">8</p>
              </div>
              <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">حالات موقوفة</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">5</p>
              </div>
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">تصاريح جديدة</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">32</p>
              </div>
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 opacity-70 flex-shrink-0" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
