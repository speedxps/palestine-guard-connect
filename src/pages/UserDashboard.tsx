import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Shield, 
  Car,
  ShieldCheck,
  Computer,
  FileText,
  Settings,
  AlertTriangle,
  Plus,
  Users,
  Eye,
  CheckSquare,
  Rss,
  MessageCircle,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole, getAllowedPages, hasAccess } = useRoleBasedAccess();

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'مدير النظام',
      traffic_manager: 'مدير شرطة المرور',
      cid_manager: 'مدير المباحث الجنائية',
      special_manager: 'مدير الشرطة الخاصة',
      cybercrime_manager: 'مدير الجرائم الإلكترونية',
      traffic_police: 'شرطة المرور',
      cid: 'المباحث الجنائية',
      special_police: 'الشرطة الخاصة',
      cybercrime: 'الجرائم الإلكترونية',
      officer: 'ضابط',
      user: 'مستخدم'
    };
    return roleNames[role] || 'مستخدم';
  };

  const getAllPages = () => {
    return [
      { 
        name: 'dashboard', 
        title: 'الصفحة الرئيسية', 
        path: '/dashboard', 
        icon: Crown, 
        color: 'from-blue-500 to-blue-600',
        description: 'عرض الإحصائيات العامة والملخص'
      },
      { 
        name: 'profile', 
        title: 'الملف الشخصي', 
        path: '/profile', 
        icon: Settings, 
        color: 'from-gray-500 to-gray-600',
        description: 'إدارة المعلومات الشخصية'
      },
      { 
        name: 'admin-panel', 
        title: 'لوحة الإدارة', 
        path: '/admin-panel', 
        icon: Settings, 
        color: 'from-purple-500 to-purple-600',
        description: 'إدارة النظام والمستخدمين'
      },
      { 
        name: 'incidents', 
        title: 'البلاغات', 
        path: '/incidents', 
        icon: AlertTriangle, 
        color: 'from-red-500 to-red-600',
        description: 'عرض وإدارة البلاغات'
      },
      { 
        name: 'incidents-management', 
        title: 'إدارة البلاغات', 
        path: '/incidents-management', 
        icon: Settings, 
        color: 'from-red-400 to-red-500',
        description: 'إدارة متقدمة للبلاغات'
      },
      { 
        name: 'new-incident', 
        title: 'بلاغ جديد', 
        path: '/new-incident', 
        icon: Plus, 
        color: 'from-orange-500 to-orange-600',
        description: 'إنشاء بلاغ جديد'
      },
      { 
        name: 'cybercrime', 
        title: 'الجرائم الإلكترونية', 
        path: '/cybercrime', 
        icon: Computer, 
        color: 'from-indigo-500 to-indigo-600',
        description: 'إدارة قضايا الجرائم الإلكترونية'
      },
      { 
        name: 'cybercrime-advanced', 
        title: 'لوحة التحكم المتقدمة', 
        path: '/cybercrime-advanced', 
        icon: Shield, 
        color: 'from-indigo-600 to-purple-600',
        description: 'نظام إدارة الأمن السيبراني المتقدم'
      },
      { 
        name: 'cybercrime-reports', 
        title: 'تقارير الجرائم الإلكترونية', 
        path: '/cybercrime-reports', 
        icon: FileText, 
        color: 'from-indigo-400 to-indigo-500',
        description: 'عرض تقارير مفصلة'
      },
      { 
        name: 'reports', 
        title: 'التقارير والإحصائيات', 
        path: '/reports', 
        icon: BarChart3, 
        color: 'from-blue-500 to-cyan-500',
        description: 'تقارير وتحليلات إحصائية'
      },
      { 
        name: 'violations', 
        title: 'المخالفات', 
        path: '/violations', 
        icon: FileText, 
        color: 'from-yellow-500 to-yellow-600',
        description: 'إدارة مخالفات المرور'
      },
      { 
        name: 'violations-admin', 
        title: 'إدارة المخالفات', 
        path: '/violations-admin', 
        icon: Settings, 
        color: 'from-yellow-400 to-yellow-500',
        description: 'إدارة متقدمة للمخالفات'
      },
      { 
        name: 'vehicle-lookup', 
        title: 'البحث عن مركبة', 
        path: '/vehicle-lookup', 
        icon: Car, 
        color: 'from-blue-400 to-blue-500',
        description: 'البحث في قاعدة بيانات المركبات'
      },
      { 
        name: 'tasks', 
        title: 'المهام', 
        path: '/tasks', 
        icon: CheckSquare, 
        color: 'from-green-500 to-green-600',
        description: 'إدارة المهام والواجبات'
      },
      { 
        name: 'patrol', 
        title: 'الدوريات', 
        path: '/patrol', 
        icon: Users, 
        color: 'from-teal-500 to-teal-600',
        description: 'إدارة الدوريات الأمنية'
      },
      { 
        name: 'feed', 
        title: 'التغذية الإخبارية', 
        path: '/feed', 
        icon: Rss, 
        color: 'from-pink-500 to-pink-600',
        description: 'آخر الأخبار والتحديثات'
      },
      { 
        name: 'chat', 
        title: 'المحادثات', 
        path: '/chat', 
        icon: MessageCircle, 
        color: 'from-violet-500 to-violet-600',
        description: 'نظام المراسلة الداخلي'
      },
      { 
        name: 'wanted-persons-tree', 
        title: 'المطلوبون', 
        path: '/wanted-persons-tree', 
        icon: Users, 
        color: 'from-red-600 to-red-700',
        description: 'قائمة الأشخاص المطلوبين'
      },
      { 
        name: 'face-recognition', 
        title: 'التعرف على الوجوه', 
        path: '/face-recognition', 
        icon: Eye, 
        color: 'from-indigo-500 to-purple-500',
        description: 'نظام التعرف على الوجوه'
      },
      { 
        name: 'police-news', 
        title: 'أخبار الشرطة', 
        path: '/police-news', 
        icon: FileText, 
        color: 'from-slate-500 to-slate-600',
        description: 'الأخبار الرسمية للشرطة'
      }
    ];
  };

  const allowedPages = getAllowedPages();
  const allPages = getAllPages();
  
  const accessiblePages = allPages.filter(page => allowedPages.includes(page.name));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-arabic">
                    صلاحيات المستخدم
                  </h1>
                  <p className="text-sm text-gray-600">عرض الصفحات المسموح بالوصول إليها</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="font-arabic">
              {getRoleName(userRole || 'user')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <Users className="h-5 w-5" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-semibold font-arabic">{user?.full_name || user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الصفحات المسموحة</p>
                <p className="font-semibold text-blue-600">{accessiblePages.length} صفحة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessible Pages */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <Shield className="h-5 w-5" />
              الصفحات المتاحة لك ({accessiblePages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessiblePages.map((page) => {
                const Icon = page.icon;
                return (
                  <Card 
                    key={page.name}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50"
                    onClick={() => navigate(page.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${page.color} shrink-0`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 font-arabic text-sm mb-1">
                            {page.title}
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {page.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Restricted Pages Info */}
        <Card className="bg-red-50/90 backdrop-blur-sm border-red-200">
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              ملاحظة هامة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              يمكنك الوصول فقط للصفحات المعروضة أعلاه حسب صلاحيات دورك في النظام. 
              للحصول على صلاحيات إضافية، يرجى التواصل مع مدير النظام.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;