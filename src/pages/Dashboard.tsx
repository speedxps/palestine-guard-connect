import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserManagement } from '@/components/UserManagement';
import { PasswordResetManagement } from '@/components/PasswordResetManagement';
import CybercrimeAccessManagement from '@/components/CybercrimeAccessManagement';
import { 
  FileText, 
  AlertTriangle, 
  MapPin, 
  Shield, 
  Home, 
  User,
  ChevronRight,
  Bell,
  Users,
  Newspaper,
  Calendar,
  Search
} from 'lucide-react';
import policeLogoUrl from '@/assets/police-logo.png';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const stats = [
    { label: 'إجمالي البلاغات', value: '24', color: 'text-blue-400' },
    { label: 'المهام النشطة', value: '12', color: 'text-green-400' },
    { label: 'الدوريات النشطة', value: '8', color: 'text-yellow-400' },
  ];

  const menuItems = [
    {
      id: 'feed',
      titleAr: 'آخر الأخبار',
      titleEn: 'News Feed',
      icon: Newspaper,
      route: '/feed',
      description: 'آخر الأخبار والمنشورات',
    },
    {
      id: 'violations',
      titleAr: 'استعلام المخالفات والقضايا',
      titleEn: 'Violations & Cases Inquiry',
      icon: Search,
      route: '/violations',
      description: 'البحث برقم الهوية',
    },
    {
      id: 'incidents',
      titleAr: 'الأحداث',
      titleEn: 'Incidents',
      icon: FileText,
      route: '/incidents',
      description: 'عرض جميع البلاغات والحوادث',
    },
    {
      id: 'emergency',
      titleAr: 'البلاغ الطارئ',
      titleEn: 'Emergency Report',
      icon: AlertTriangle,
      route: '/new-incident',
      description: 'إبلاغ عن حالة طوارئ',
      variant: 'emergency' as const,
    },
    {
      id: 'patrols',
      titleAr: 'الدوريات',
      titleEn: 'Patrols',
      icon: MapPin,
      route: '/patrol',
      description: 'متابعة الدوريات',
    },
    {
      id: 'tasks',
      titleAr: 'المهام',
      titleEn: 'Tasks',
      icon: Calendar,
      route: '/tasks',
      description: 'متابعة المهام والواجبات',
    },
    {
      id: 'cyber',
      titleAr: 'الجرائم السيبرانية',
      titleEn: 'Cyber Crimes',
      icon: Shield,
      route: '/cybercrime',
      description: 'التواصل الآمن والجرائم الإلكترونية',
    },
  ];

  // Add user management option for admin users
  if (user?.role === 'admin') {
    menuItems.push({
      id: 'users',
      titleAr: 'إدارة المستخدمين',
      titleEn: 'User Management',
      icon: Users,
      route: '#',
      description: 'إدارة المستخدمين والصلاحيات',
    });
    menuItems.push({
      id: 'password-resets',
      titleAr: 'طلبات كلمة المرور',
      titleEn: 'Password Requests',
      icon: Users,
      route: '#',
      description: 'مراجعة طلبات إعادة تعيين كلمة المرور',
    });
    menuItems.push({
      id: 'cybercrime-access',
      titleAr: 'صلاحيات الجرائم الإلكترونية',
      titleEn: 'Cybercrime Access',
      icon: Shield,
      route: '#',
      description: 'إدارة صلاحيات ضباط الجرائم الإلكترونية',
    });
     menuItems.push({
       id: 'incidents-management',
       titleAr: 'إدارة البلاغات',
       titleEn: 'Incidents Management',
       icon: FileText,
       route: '/incidents-management',
       description: 'إدارة ومتابعة جميع البلاغات',
     });
  }

  const handleNavigation = (route: string, itemId?: string) => {
    if (itemId === 'users') {
      setActiveTab('users');
    } else if (itemId === 'password-resets') {
      setActiveTab('password-resets');
    } else if (itemId === 'cybercrime-access') {
      setActiveTab('cybercrime-access');
    } else {
      navigate(route);
    }
  };

  if (activeTab === 'users') {
    return (
      <div className="mobile-container">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              ← العودة للوحة الرئيسية
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-20">
          <UserManagement />
        </div>
      </div>
    );
  }

  if (activeTab === 'password-resets') {
    return (
      <div className="mobile-container">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              ← العودة للوحة الرئيسية
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-20">
          <PasswordResetManagement />
        </div>
      </div>
    );
  }

  if (activeTab === 'cybercrime-access') {
    return (
      <div className="mobile-container">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              ← العودة للوحة الرئيسية
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-20">
          <CybercrimeAccessManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
              alt="Palestinian Police Department Logo" 
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-bold font-arabic">الشرطة الفلسطينية</h1>
              <p className="text-xs text-muted-foreground">مرحباً، {user?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {/* Latest News Alert */}
        <Card className="emergency-alert p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground font-arabic">آخر الأخبار من المدير</h3>
              <p className="text-sm text-muted-foreground mt-1 font-arabic">
                تم تحديث بروتوكولات الأمان الجديدة، يرجى مراجعة التعليمات
              </p>
            </div>
            <Bell className="h-4 w-4 text-primary" />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-arabic">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Dashboard Title */}
        <div>
          <h2 className="text-xl font-bold font-inter mb-4">DASHBOARD</h2>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isEmergency = item.variant === 'emergency';
            
            return (
              <Card
                key={item.id}
                className={`nav-item cursor-pointer ${
                  isEmergency ? 'border-emergency/30 bg-emergency-bg/30' : ''
                }`}
                onClick={() => handleNavigation(item.route, item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    isEmergency 
                      ? 'bg-emergency/20' 
                      : 'bg-primary/20'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isEmergency 
                        ? 'text-emergency' 
                        : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-arabic text-base">
                        {item.titleAr}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-inter">
                      {item.titleEn}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card/80 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-around py-3">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Home className="h-5 w-5 text-primary" />
            <span className="text-xs text-primary">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;