import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PoliceNews from '@/components/dashboard/PoliceNews';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Shield, 
  Clock,
  TrendingUp,
  Calendar,
  Users,
  Bot
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role;

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
        title: 'المساعد الذكي للشرطة',
        description: 'محادثة ذكية مع المساعد',
        icon: Bot,
        color: 'from-violet-500 to-violet-600',
        path: '/police-assistant'
      },
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
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        <div className="responsive-padding space-y-4 sm:space-y-6" dir="rtl">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-primary-glow flex-shrink-0">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 font-arabic break-words">
                مرحباً، {user?.full_name || 'المستخدم'}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-arabic bg-primary/10 text-primary text-xs w-fit">
                  {getRoleName(userRole || 'user')}
                </Badge>
                <span className="text-gray-600 font-arabic text-xs sm:text-sm">
                  الشرطة الفلسطينية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 font-arabic mb-3 sm:mb-4">
            الإحصائيات العامة
          </h2>
          <StatsCards />
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 font-arabic mb-3 sm:mb-4">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* User Dashboard Access */}
            <Card 
              className="p-3 sm:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-lg sm:rounded-xl" 
              onClick={() => navigate('/user-dashboard')}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 font-arabic text-xs sm:text-sm truncate">
                    صلاحياتي
                  </h3>
                  <p className="text-xs text-gray-600 font-arabic line-clamp-2">
                    عرض الصفحات المسموح بالوصول إليها
                  </p>
                </div>
              </div>
            </Card>
            
            {getQuickActions().map((action, index) => {
              const Icon = action.icon;
              const getActionPath = (title: string) => {
                switch (title) {
                  case 'المساعد الذكي للشرطة': return '/police-assistant';
                  case 'الإحصائيات اليومية': return '/overview';
                  case 'المهام العاجلة': return '/urgent-tasks';
                  case 'الجدولة': return '/scheduling';
                  case 'إدارة المستخدمين': {
                    // حسب الدور، الانتقال لصفحة الإدارة المناسبة
                    if (userRole === 'admin') return '/admin-panel';
                    if (userRole === 'traffic_manager') return '/department-users/traffic';
                    if (userRole === 'cid_manager') return '/department-users/cid';
                    if (userRole === 'special_manager') return '/department-users/special';
                    if (userRole === 'cybercrime_manager') return '/department-users/cybercrime';
                    return '/dashboard';
                  }
                  default: return '/dashboard';
                }
              };
              
              return (
                <Card 
                  key={index} 
                  className="p-3 sm:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-lg sm:rounded-xl"
                  onClick={() => navigate(action.path || getActionPath(action.title))}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 font-arabic text-xs sm:text-sm truncate">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-arabic line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Police News */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 font-arabic mb-3 sm:mb-4">
            الأخبار الرسمية
          </h2>
          <PoliceNews />
        </div>

        {/* Recent Activity */}
        <div className="pb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 font-arabic mb-3 sm:mb-4">
            النشاط الأخير
          </h2>
          <RecentActivity />
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;