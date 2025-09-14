import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceReportButton from '@/components/VoiceReportButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useLanguage';
import { UserManagement } from '@/components/UserManagement';
import { PasswordResetManagement } from '@/components/PasswordResetManagement';
import CybercrimeAccessManagement from '@/components/CybercrimeAccessManagement';
import VoiceAssistant from '@/components/VoiceAssistant';
import { supabase } from '@/integrations/supabase/client';
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
  Search,
  Info
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [latestNews, setLatestNews] = useState({ title: t('dashboard.welcome'), content: t('general.loading') });

  // Fetch latest news from admin
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        // First get admin profile
        const { data: adminProfile, error: adminError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'admin')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (adminProfile && !adminError) {
          // Then get their latest post
          const { data: latestPost, error: postError } = await supabase
            .from('posts')
            .select('content, created_at')
            .eq('user_id', adminProfile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestPost && !postError) {
            setLatestNews({
              title: `آخر الأخبار من ${adminProfile.full_name}`,
              content: latestPost.content || 'لا توجد أخبار جديدة حالياً'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching latest news:', error);
      }
    };

    fetchLatestNews();
  }, []);

  const stats = [
    { label: t('dashboard.recent_incidents'), value: '24', color: 'text-blue-400' },
    { label: t('dashboard.pending_tasks'), value: '12', color: 'text-green-400' },
    { label: t('dashboard.active_patrols'), value: '8', color: 'text-yellow-400' },
  ];

  const menuItems = [
    {
      id: 'police-news',
      title: 'أخبار الشرطة الفلسطينية',
      icon: Newspaper,
      route: '/police-news',
      description: 'آخر الأخبار والتحديثات الرسمية',
    },
    {
      id: 'feed',
      title: t('nav.feed'),
      icon: Newspaper,
      route: '/feed',
      description: t('nav.feed'),
    },
    {
      id: 'violations',
      title: t('nav.violations'),
      icon: Search,
      route: '/violations',
      description: t('nav.violations'),
    },
    {
      id: 'incidents',
      title: t('nav.incidents'),
      icon: FileText,
      route: '/incidents',
      description: t('nav.incidents'),
    },
    {
      id: 'emergency',
      title: t('nav.new_incident'),
      icon: AlertTriangle,
      route: '/new-incident',
      description: t('nav.new_incident'),
      variant: 'emergency' as const,
    },
    {
      id: 'patrols',
      title: t('nav.patrol'),
      icon: MapPin,
      route: '/patrol',
      description: t('nav.patrol'),
    },
    {
      id: 'tasks',
      title: t('nav.tasks'),
      icon: Calendar,
      route: '/tasks',  
      description: t('nav.tasks'),
    },
    {
      id: 'cyber',
      title: t('nav.cybercrime'),
      icon: Shield,
      route: '/cybercrime',
      description: t('nav.cybercrime'),
    },
    {
      id: 'about',
      title: t('nav.about'),
      icon: Info,
      route: '/about',
      description: t('nav.about'),
    },
    {
      id: 'vehicle-lookup',
      title: 'الاستعلام عن السيارات',
      icon: Search,
      route: '/vehicle-lookup',
      description: 'البحث عن السيارات برقم اللوحة',
    },
    {
      id: 'face-recognition',
      title: 'التعرف على الوجوه',
      icon: Search,
      route: '/face-recognition',
      description: 'البحث عن الأشخاص بالصور',
    },
    {
      id: 'reports',
      title: 'التقارير والإحصائيات',
      icon: FileText,
      route: '/reports',
      description: 'تقارير شاملة للنظام',
    },
  ];

    // Add admin panel option for admin users
    if (user?.role === 'admin') {
      menuItems.push({
        id: 'admin-panel',
        title: 'لوحة تحكم الإدارة',
        icon: Shield,
        route: '/admin',
        description: 'إدارة شاملة للنظام',
      });
    }

    // Add user management option for admin users
    if (user?.role === 'admin') {
    menuItems.push({
      id: 'users',
      title: 'User Management',
      icon: Users,
      route: '#',
      description: 'User Management',
    });
    menuItems.push({
      id: 'password-resets',
      title: 'Password Requests',
      icon: Users,
      route: '#',
      description: 'Password Reset Requests',
    });
    menuItems.push({
      id: 'cybercrime-access',
      title: 'Cybercrime Access',
      icon: Shield,
      route: '#',
      description: 'Cybercrime Access Management',
    });
    menuItems.push({
      id: 'incidents-management',
      title: 'Incidents Management',
      icon: FileText,
      route: '/incidents-management',
      description: 'Incidents Management',
    });
    menuItems.push({
      id: 'citizen-records',
      title: t('nav.citizen_records'),
      icon: Users,
      route: '/citizen-records',
      description: t('citizen_records.subtitle'),
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
              ← {t('general.back')}
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

        <div className="px-4 pb-32">
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

        <div className="px-4 pb-32">
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

        <div className="px-4 pb-32">
          <CybercrimeAccessManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      {/* Enhanced Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-card/30 border-b border-border/20">
        <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Department Logo" 
                className="relative w-12 h-12 rounded-full shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold font-arabic bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                الشرطة الفلسطينية
              </h1>
              <p className="text-sm text-muted-foreground font-arabic">{t('dashboard.welcome')}، {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VoiceReportButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="relative h-10 w-10 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20"
            >
              <User className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
        </div>
      </div>

      <div className="px-6 py-8 pb-32 space-y-8">
        {/* Hero News Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground font-arabic mb-2">{latestNews.title}</h3>
              <p className="text-muted-foreground font-arabic leading-relaxed">
                {latestNews.content}
              </p>
            </div>
            <div className="p-2 bg-primary/20 rounded-full animate-pulse">
              <Bell className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative text-center">
                <div className={`text-3xl font-bold mb-1 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-arabic font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Voice Assistant */}
        <div className="bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-1 shadow-xl">
          <VoiceAssistant />
        </div>

        {/* Dashboard Section Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold font-inter mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            CONTROL PANEL
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
        </div>

        {/* Enhanced Menu Grid */}
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isEmergency = item.variant === 'emergency';
            
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  isEmergency 
                    ? 'bg-gradient-to-r from-red-500/10 via-red-400/5 to-orange-500/10 border-2 border-red-500/20' 
                    : 'bg-gradient-to-r from-card/60 to-card/40 border border-border/30'
                } backdrop-blur-sm`}
                onClick={() => handleNavigation(item.route, item.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-5">
                  <div className="flex items-center gap-5">
                    <div className={`relative p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
                      isEmergency 
                        ? 'bg-gradient-to-br from-red-500 to-red-600' 
                        : 'bg-gradient-to-br from-primary to-primary/80'
                    }`}>
                      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Icon className="relative h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold font-arabic text-foreground group-hover:text-primary transition-colors duration-300">
                          {item.title}
                        </h3>
                        {isEmergency && (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-inter font-medium">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground/80 font-arabic mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-12">
                      <ChevronRight className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
        <div className="m-4 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-xl">
          <div className="flex items-center justify-around py-4">
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center gap-2 h-auto py-3 px-6 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300"
            >
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xs text-primary font-semibold">{t('nav.dashboard')}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center gap-2 h-auto py-3 px-6 rounded-xl hover:bg-muted/50 transition-all duration-300"
              onClick={() => navigate('/profile')}
            >
              <User className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-semibold">{t('nav.profile')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;