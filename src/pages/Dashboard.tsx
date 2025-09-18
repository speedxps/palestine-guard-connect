import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VoiceAssistant from '@/components/VoiceAssistant';
import PoliceNews from '@/components/dashboard/PoliceNews';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { 
  Crown, 
  Shield, 
  Clock,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole } = useRoleBasedAccess();

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'مدير النظام',
      traffic_police: 'شرطة المرور',
      cid: 'المباحث الجنائية',
      special_police: 'الشرطة الخاصة',
      cybercrime: 'الجرائم الإلكترونية',
      officer: 'ضابط',
      user: 'مستخدم'
    };
    return roleNames[role] || 'مستخدم';
  };

  const getQuickActions = () => {
    const quickActions = [
      {
        title: 'الإحصائيات اليومية',
        description: 'عرض أداء اليوم',
        icon: TrendingUp,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'المهام العاجلة',
        description: 'المهام المطلوب إنجازها',
        icon: Clock,
        color: 'from-orange-500 to-orange-600'
      },
      {
        title: 'الجدولة',
        description: 'مواعيد وأنشطة اليوم',
        icon: Calendar,
        color: 'from-green-500 to-green-600'
      }
    ];
    
    if (userRole === 'admin') {
      quickActions.push({
        title: 'إدارة المستخدمين',
        description: 'إضافة وتعديل المستخدمين',
        icon: Users,
        color: 'from-purple-500 to-purple-600'
      });
    }
    
    return quickActions;
  };


  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" dir="rtl">
        {/* Welcome Section with Police Logo */}
        <div className="flex items-center gap-4 mb-8 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground font-arabic mb-2">
              مرحباً بك، {user?.full_name || 'نور الدين خلاف'}
            </h1>
            <p className="text-muted-foreground font-arabic text-lg mb-3">
              الشرطة الفلسطينية
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="font-arabic bg-blue-600 hover:bg-blue-700 text-white px-4 py-1">
                {getRoleName(userRole || 'user')}
              </Badge>
              <span className="text-sm text-muted-foreground font-arabic">
                أهلاً بك في النظام
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Matching Reference Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">8</div>
              <div className="font-arabic text-lg">الدوريات النشطة</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">12</div>
              <div className="font-arabic text-lg">المهام المعلقة</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-sky-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">24</div>
              <div className="font-arabic text-lg">البلاغات الحديثة</div>
            </div>
          </div>
        </div>

        {/* Control Panel Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground font-arabic tracking-wider">
              CONTROL PANEL
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
          </div>
        </div>

        {/* Latest Updates Section */}
        <div className="mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-blue-600">
                  <div className="w-6 h-6 bg-white/20 rounded"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-arabic text-foreground">
                    آخر الأخبار من عمر علي
                  </h3>
                  <p className="text-muted-foreground font-arabic">مرحباً بكم</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-700">
                  <div className="w-6 h-6 bg-white/90 rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Updates and Violations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-blue-700">
                <div className="w-8 h-8 bg-white/90 rounded"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold font-arabic text-foreground">التحديثات</h3>
                <p className="text-sm text-muted-foreground font-arabic">التحديثات</p>
                <p className="text-xs text-muted-foreground font-arabic">التحديثات</p>
              </div>
              <div className="text-muted-foreground">
                <div className="w-6 h-6 border-2 border-muted-foreground rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-blue-700">
                <div className="w-8 h-8 bg-white/90 rounded"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold font-arabic text-foreground">المخالفات</h3>
                <p className="text-sm text-muted-foreground font-arabic">عرض المخالفات</p>
              </div>
              <div className="text-muted-foreground">
                <div className="w-6 h-6 border-2 border-muted-foreground rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-6 text-center">
            <div className="mb-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                <div className="w-6 h-6 bg-muted-foreground/60 rounded-full"></div>
              </div>
            </div>
            <h3 className="font-arabic font-semibold text-foreground">الملف الشخصي</h3>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-6 text-center">
            <div className="mb-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 flex items-center justify-center">
                <div className="w-6 h-6 bg-white/90 rounded"></div>
              </div>
            </div>
            <h3 className="font-arabic font-semibold text-foreground">لوحة التحكم</h3>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;