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
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <div className="responsive-padding space-y-4 sm:space-y-6" dir="rtl">
        {/* Welcome Section with Icons */}
        <div className="mb-6 bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 font-arabic">
              Welcome Mr. {user?.full_name || 'المستخدم'}
            </h1>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Police Badge */}
          <div className="flex justify-end">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-green-600 font-arabic mb-4">
            Tickets
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Traffic Police */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/department/traffic')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">شرطة المرور</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">إدارة حركة المرور والمخالفات</p>
                </div>
              </div>
            </Card>

            {/* Special Police */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/department/special-police')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">الشرطة الخاصة</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">العمليات الخاصة والهجوم الأمني</p>
                </div>
              </div>
            </Card>

            {/* Judicial Police */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/department/judicial-police')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">الشرطة القضائية</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">التعاون مع المحاكم والنيابة</p>
                </div>
              </div>
            </Card>

            {/* Admin Department */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/department/admin')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">الإدارة العامة</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">لوحة الإدارة والتحكم في النظام</p>
                </div>
              </div>
            </Card>

            {/* CID */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/department/cid')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-red-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">المباحث الجنائية</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">التحقيق في الجرائم ومعالجة الأدلة</p>
                </div>
              </div>
            </Card>

            {/* Cybercrime */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/department/cybercrime')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">الجرائم الإلكترونية</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">مكافحة الجرائم الإلكترونية والأمن السيبراني</p>
                </div>
              </div>
            </Card>

            {/* Police Tech */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/police-assistant')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">مباحث تكنولوجيا الشرطة</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">مساعدة تكنولوجية ذكية</p>
                </div>
              </div>
            </Card>

            {/* News */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/police-news')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">صحيفة</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">عرض الأخبار والتصريحات الصحفية</p>
                </div>
              </div>
            </Card>

            {/* Devices */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/user-dashboard')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">أجهزة</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">مواجع واجهزة الاتصال اليوم</p>
                </div>
              </div>
            </Card>

            {/* Users Management */}
            <Card 
              className="p-4 hover:shadow-lg transition-all cursor-pointer bg-white rounded-xl border-0 shadow-md"
              onClick={() => navigate('/admin-panel')}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arabic text-sm">مرة المستخدمين</h3>
                  <p className="text-xs text-gray-500 font-arabic mt-1">إضافة وتعديل المستخدمين</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
          <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.0!2d35.2!3d31.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDU0JzAwLjAiTiAzNcKwMTInMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        {/* News Section */}
        <div className="pb-4">
          <div className="bg-gradient-to-r from-blue-400 to-green-400 rounded-t-xl p-4">
            <h2 className="text-2xl font-bold text-white">
              News
            </h2>
          </div>
          <div className="bg-white rounded-b-xl p-4 shadow-md">
            <PoliceNews />
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;