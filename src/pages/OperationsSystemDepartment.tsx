import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Bell,
  Database,
  FileText,
  Radio,
  Activity
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function OperationsSystemDepartment() {
  const navigate = useNavigate();

  const operationsTools = [
    {
      title: 'إدارة البلاغات والمهام',
      description: 'متابعة وتوزيع البلاغات على الأقسام والدوريات',
      icon: Radio,
      path: '/incidents',
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'إدارة المستخدمين',
      description: 'إدارة حسابات المستخدمين والصلاحيات',
      icon: Users,
      path: '/admin/user-management',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'إدارة الأقسام',
      description: 'الإشراف على جميع الأقسام والموظفين',
      icon: Shield,
      path: '/admin/departments',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'التقارير والإحصائيات',
      description: 'عرض التقارير التفصيلية والإحصائيات',
      icon: BarChart3,
      path: '/reports',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'مراقبة النظام',
      description: 'متابعة أداء النظام والسجلات',
      icon: Activity,
      path: '/admin/system-monitoring',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'الإشعارات',
      description: 'إدارة وإرسال الإشعارات للمستخدمين',
      icon: Bell,
      path: '/admin/notifications',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      title: 'قاعدة البيانات',
      description: 'إدارة البيانات والسجلات',
      icon: Database,
      path: '/admin/database',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      title: 'السجلات الأمنية',
      description: 'مراجعة سجلات الدخول والأنشطة',
      icon: FileText,
      path: '/login-history',
      color: 'from-rose-500 to-red-500'
    },
    {
      title: 'إعدادات النظام',
      description: 'التحكم الكامل بإعدادات النظام',
      icon: Settings,
      path: '/admin/settings',
      color: 'from-gray-500 to-slate-500'
    },
    {
      title: 'المهام العاجلة',
      description: 'متابعة المهام ذات الأولوية العالية',
      icon: ClipboardList,
      path: '/urgent-tasks',
      color: 'from-orange-500 to-red-600'
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
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                قسم العمليات وإدارة الجهاز
              </h1>
            </div>
            <p className="text-muted-foreground text-lg mr-14">
              الإشراف الكامل على النظام وإدارة البلاغات والمهام والصلاحيات
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operationsTools.map((tool, index) => (
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
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">البلاغات النشطة</p>
                <p className="text-3xl font-bold text-blue-600">47</p>
              </div>
              <Radio className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">المهام المكتملة</p>
                <p className="text-3xl font-bold text-green-600">234</p>
              </div>
              <ClipboardList className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">المستخدمون النشطون</p>
                <p className="text-3xl font-bold text-purple-600">89</p>
              </div>
              <Users className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">حالات الطوارئ</p>
                <p className="text-3xl font-bold text-orange-600">3</p>
              </div>
              <Bell className="h-10 w-10 text-orange-500 opacity-70" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
