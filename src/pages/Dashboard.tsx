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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-white">
        <div className="p-6 space-y-6" dir="rtl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-primary-glow">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-arabic">
                مرحباً، {user?.full_name || 'المستخدم'}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-arabic bg-primary/10 text-primary">
                  {getRoleName(userRole || 'user')}
                </Badge>
                <span className="text-gray-600 font-arabic text-sm">
                  الشرطة الفلسطينية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 font-arabic mb-4">
            الإحصائيات العامة
          </h2>
          <StatsCards />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 font-arabic mb-4">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Dashboard Access */}
            <Card 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white border border-gray-200" 
              onClick={() => navigate('/user-dashboard')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 font-arabic text-sm">
                    صلاحياتي
                  </h3>
                  <p className="text-xs text-gray-600 font-arabic">
                    عرض الصفحات المسموح بالوصول إليها
                  </p>
                </div>
              </div>
            </Card>
            
            {getQuickActions().map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 font-arabic text-sm">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-arabic">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Voice Assistant */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 font-arabic mb-4">
            المساعد الذكي
          </h2>
          <Card className="p-4 bg-white border border-gray-200">
            <VoiceAssistant />
          </Card>
        </div>

        {/* Police News */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 font-arabic mb-4">
            الأخبار الرسمية
          </h2>
          <PoliceNews />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 font-arabic mb-4">
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