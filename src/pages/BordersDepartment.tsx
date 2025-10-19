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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                قسم المعابر والحدود
              </h1>
            </div>
            <p className="text-muted-foreground text-lg mr-14">
              مراقبة وإدارة حركة الدخول والخروج من المعابر والتنسيق الأمني
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bordersTools.map((tool, index) => (
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات عبور اليوم</p>
                <p className="text-3xl font-bold text-green-600">1,247</p>
              </div>
              <Users className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">المعابر النشطة</p>
                <p className="text-3xl font-bold text-blue-600">8</p>
              </div>
              <MapPin className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">حالات موقوفة</p>
                <p className="text-3xl font-bold text-red-600">5</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">تصاريح جديدة</p>
                <p className="text-3xl font-bold text-purple-600">32</p>
              </div>
              <FileText className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
