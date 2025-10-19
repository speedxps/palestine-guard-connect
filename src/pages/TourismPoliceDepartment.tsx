import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Camera, 
  MapPin, 
  Users, 
  Shield,
  AlertCircle,
  Map,
  FileText,
  TrendingUp
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function TourismPoliceDepartment() {
  const navigate = useNavigate();

  const tourismTools = [
    {
      title: 'المواقع السياحية',
      description: 'إدارة ومراقبة المواقع السياحية والأثرية',
      icon: MapPin,
      path: '/department/tourism/sites',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'مساعدة الزوار',
      description: 'خدمات المساعدة والإرشاد للسياح',
      icon: Users,
      path: '/department/tourism/assistance',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'البلاغات السياحية',
      description: 'إدارة البلاغات المتعلقة بالسياحة',
      icon: AlertCircle,
      path: '/incidents',
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'خريطة المواقع',
      description: 'عرض المواقع السياحية على الخريطة',
      icon: Map,
      path: '/department/tourism/map',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'تنظيم الحركة',
      description: 'تنظيم حركة السياح والزوار',
      icon: Shield,
      path: '/department/tourism/traffic-control',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'المراقبة الأمنية',
      description: 'كاميرات المراقبة والتأمين',
      icon: Camera,
      path: '/department/tourism/surveillance',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      title: 'التقارير اليومية',
      description: 'تقارير الأنشطة والزيارات',
      icon: FileText,
      path: '/reports',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      title: 'إحصائيات الزوار',
      description: 'تحليل أعداد وحركة السياح',
      icon: TrendingUp,
      path: '/department/tourism/statistics',
      color: 'from-rose-500 to-red-500'
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
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                قسم الشرطة السياحية
              </h1>
            </div>
            <p className="text-muted-foreground text-lg mr-14">
              حفظ أمن المواقع السياحية ومساعدة الزوار وتنظيم الحركة السياحية
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tourismTools.map((tool, index) => (
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
                <p className="text-sm text-muted-foreground mb-1">زوار اليوم</p>
                <p className="text-3xl font-bold text-green-600">876</p>
              </div>
              <Users className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">المواقع المؤمنة</p>
                <p className="text-3xl font-bold text-blue-600">24</p>
              </div>
              <MapPin className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">حالات طارئة</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">طلبات المساعدة</p>
                <p className="text-3xl font-bold text-purple-600">15</p>
              </div>
              <Shield className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
