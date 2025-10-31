import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTicketsCount } from "@/hooks/useTicketsCount";
import { useGPSTracking } from "@/hooks/useGPSTracking";
import { useUserRoles, UserRole } from "@/hooks/useUserRoles";
import { Switch } from "@/components/ui/switch";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, RotateCw, Phone, Badge as BadgeIcon, Car, Shield, Scale, Settings, Search, Wifi, Bot, Newspaper, Lock, Users, AlertCircle, Radio, MapPin, Palmtree, GitBranch, FileText, UserSearch, ClipboardList, Eye, Siren, MessageSquare, Target, Globe, FileCheck, Camera } from "lucide-react";
import policeLogo from "@/assets/police-logo.png";
import ModernSidebar from "@/components/layout/ModernSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import LoginHistoryBell from "@/components/LoginHistoryBell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Quick Access Button Type
interface QuickAccessButton {
  title: string;
  icon: any;
  path: string;
  gradient: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { hasAccess } = useRoleBasedAccess();
  const { roles, hasRole, hasAnyRole, isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const { ticketsCounts } = useTicketsCount();
  const { isTracking, startTracking, stopTracking } = useGPSTracking();
  const [newsDrawerOpen, setNewsDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);
  const [newsItems, setNewsItems] = useState<any[]>([]);

  // Get quick access buttons based on user roles
  const getQuickAccessButtons = (): QuickAccessButton[] => {
    // Admin - Operations System
    if (isAdmin || hasRole('operations_system')) {
      return [
        { title: "البحث الشامل", icon: Search, path: "/universal-search", gradient: "from-cyan-500 to-cyan-600" },
        { title: "إدارة البلاغات", icon: AlertCircle, path: "/incidents-management", gradient: "from-blue-500 to-blue-600" },
        { title: "إدارة المستخدمين", icon: Users, path: "/admin-panel", gradient: "from-indigo-500 to-indigo-600" },
        { title: "أمان الأجهزة", icon: Shield, path: "/device-management", gradient: "from-green-500 to-green-600" },
      ];
    }

    // Traffic Police
    if (hasRole('traffic_police')) {
      return [
        { title: "المخالفات", icon: Car, path: "/violations", gradient: "from-orange-500 to-orange-600" },
        { title: "المهام المطلوبة", icon: ClipboardList, path: "/department-tasks", gradient: "from-amber-500 to-amber-600" },
        { title: "الاستعلام عن مركبة", icon: Search, path: "/vehicle-inquiry", gradient: "from-yellow-500 to-yellow-600" },
        { title: "الدوريات", icon: Radio, path: "/patrol", gradient: "from-lime-500 to-lime-600" },
      ];
    }

    // CID
    if (hasRole('cid')) {
      return [
        { title: "المهام المطلوبة", icon: ClipboardList, path: "/department-tasks", gradient: "from-blue-500 to-blue-600" },
        { title: "التعرف على الوجوه", icon: Camera, path: "/face-recognition", gradient: "from-cyan-500 to-cyan-600" },
        { title: "المطلوبون", icon: UserSearch, path: "/wanted-persons-tree", gradient: "from-sky-500 to-sky-600" },
        { title: "سجل المشتبهين", icon: FileCheck, path: "/cid-suspect-search", gradient: "from-indigo-500 to-indigo-600" },
      ];
    }

    // Cybercrime
    if (hasRole('cybercrime')) {
      return [
        { title: "الجرائم الإلكترونية", icon: Shield, path: "/cybercrime", gradient: "from-purple-500 to-purple-600" },
        { title: "لوحة التحكم المتقدمة", icon: Wifi, path: "/cybercrime-advanced-dashboard", gradient: "from-violet-500 to-violet-600" },
        { title: "المهام المطلوبة", icon: ClipboardList, path: "/department-tasks", gradient: "from-fuchsia-500 to-fuchsia-600" },
        { title: "تقارير الجرائم", icon: FileText, path: "/cybercrime-reports", gradient: "from-pink-500 to-pink-600" },
      ];
    }

    // Special Police
    if (hasRole('special_police')) {
      return [
        { title: "المهام المطلوبة", icon: ClipboardList, path: "/department-tasks", gradient: "from-green-500 to-green-600" },
        { title: "الدوريات", icon: Radio, path: "/patrol", gradient: "from-emerald-500 to-emerald-600" },
        { title: "بلاغ جديد", icon: AlertCircle, path: "/new-incident", gradient: "from-teal-500 to-teal-600" },
        { title: "التواصل المشترك", icon: MessageSquare, path: "/inter-department-communication", gradient: "from-cyan-500 to-cyan-600" },
      ];
    }

    // Judicial Police
    if (hasRole('judicial_police')) {
      return [
        { title: "البحث عن القضايا", icon: Search, path: "/judicial-case-search", gradient: "from-slate-500 to-slate-600" },
        { title: "المهام المطلوبة", icon: ClipboardList, path: "/department-tasks", gradient: "from-gray-500 to-gray-600" },
        { title: "التواصل الرسمي", icon: MessageSquare, path: "/judicial-communications", gradient: "from-zinc-500 to-zinc-600" },
        { title: "تتبع القضايا", icon: Eye, path: "/judicial-tracking", gradient: "from-stone-500 to-stone-600" },
      ];
    }

    // Borders
    if (hasRole('borders')) {
      return [
        { title: "مراقبة المعابر", icon: Eye, path: "/borders-monitoring", gradient: "from-teal-500 to-teal-600" },
        { title: "قاعدة البيانات", icon: FileCheck, path: "/borders-database", gradient: "from-cyan-500 to-cyan-600" },
        { title: "البحث والاستعلام", icon: Search, path: "/borders-database", gradient: "from-sky-500 to-sky-600" },
        { title: "إدارة التصاريح", icon: FileText, path: "/borders-permits", gradient: "from-blue-500 to-blue-600" },
      ];
    }

    // Tourism Police
    if (hasRole('tourism_police')) {
      return [
        { title: "المواقع السياحية", icon: Globe, path: "/tourism-sites", gradient: "from-emerald-500 to-emerald-600" },
        { title: "مساعدة الزوار", icon: Users, path: "/tourism-assistance", gradient: "from-green-500 to-green-600" },
        { title: "البلاغات السياحية", icon: AlertCircle, path: "/incidents", gradient: "from-lime-500 to-lime-600" },
        { title: "المهام المطلوبة", icon: ClipboardList, path: "/department-tasks", gradient: "from-teal-500 to-teal-600" },
      ];
    }

    // Joint Operations
    if (hasRole('joint_operations')) {
      return [
        { title: "التنسيق مع الأجهزة", icon: MessageSquare, path: "/joint-ops-coordination", gradient: "from-purple-500 to-purple-600" },
        { title: "العمليات المشتركة", icon: Target, path: "/joint-ops-operations", gradient: "from-pink-500 to-pink-600" },
        { title: "غرفة العمليات", icon: Radio, path: "/joint-ops-command-center", gradient: "from-fuchsia-500 to-fuchsia-600" },
        { title: "الملفات المشتركة", icon: FileCheck, path: "/joint-ops-shared-files", gradient: "from-violet-500 to-violet-600" },
      ];
    }

    // Default for regular users
    return [
      { title: "المهام", icon: ClipboardList, path: "/tasks", gradient: "from-blue-500 to-blue-600" },
      { title: "البلاغات", icon: AlertCircle, path: "/incidents", gradient: "from-red-500 to-red-600" },
      { title: "التقارير", icon: FileText, path: "/reports", gradient: "from-purple-500 to-purple-600" },
      { title: "الدوريات", icon: Radio, path: "/patrol", gradient: "from-green-500 to-green-600" },
    ];
  };

  const quickAccessButtons = getQuickAccessButtons();

  const handleTrackingToggle = (checked: boolean) => {
    if (checked) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  useEffect(() => {
    fetchUnreadNewsCount();

    // Subscribe to news changes
    const channel = supabase
      .channel('news_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_news'
        },
        () => {
          fetchUnreadNewsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadNewsCount = async () => {
    if (!user) return;

    try {
      // Get all published news
      const { data: allNews } = await supabase
        .from('internal_news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!allNews) return;

      // Get news that user has read
      const { data: readNews } = await supabase
        .from('news_reads')
        .select('news_id')
        .eq('user_id', user.id);

      const readNewsIds = readNews?.map(r => r.news_id) || [];
      const unreadCount = allNews.filter(n => !readNewsIds.includes(n.id)).length;
      
      setUnreadNewsCount(unreadCount);
      setNewsItems(allNews.map(news => ({
        id: news.id,
        title: news.title,
        description: news.content.substring(0, 100) + '...',
        time: formatNewsTime(news.created_at),
      })));
    } catch (error) {
      console.error('Error fetching unread news count:', error);
    }
  };

  const formatNewsTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar');
  };

  // الأقسام والخدمات - العداد يعرض tickets من آخر 24 ساعة
  const getTicketsSubtitle = (sectionId: string) => {
    const count = ticketsCounts[sectionId] || 0;
    return `${count} Tickets`;
  };

  const tickets = [
    {
      title: "شرطة المرور",
      subtitle: getTicketsSubtitle('traffic_police'),
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: Car,
      path: "/department/traffic",
      roles: ["admin", "traffic_police"],
    },
    {
      title: "الشرطة الخاصة",
      subtitle: getTicketsSubtitle('special_police'),
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      icon: Shield,
      path: "/department/special",
      roles: ["admin", "special_police"],
    },
    {
      title: "الشرطة القضائية",
      subtitle: getTicketsSubtitle('judicial_police'),
      color: "bg-gradient-to-br from-green-500 to-green-600",
      icon: Scale,
      path: "/department/judicial-police",
      roles: ["admin", "judicial_police"],
    },
    {
      title: "الإدارة العامة",
      subtitle: getTicketsSubtitle('admin'),
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      icon: Settings,
      path: "/department/admin",
      roles: ["admin"],
    },
    {
      title: "المباحث الجنائية",
      subtitle: getTicketsSubtitle('cid'),
      color: "bg-gradient-to-br from-sky-500 to-sky-600",
      icon: Search,
      path: "/department/cid",
      roles: ["admin", "cid"],
    },
    {
      title: "الجرائم الإلكترونية",
      subtitle: getTicketsSubtitle('cybercrime'),
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      icon: Wifi,
      path: "/department/cybercrime",
      roles: ["admin", "cybercrime"],
    },
    { 
      title: "المساعد الذكي", 
      subtitle: "AI Assistant",
      color: "bg-gradient-to-br from-purple-500 to-purple-600", 
      icon: Bot,
      path: "/police-assistant", 
      roles: [] 
    },
    { 
      title: "الأخبار", 
      subtitle: "News",
      color: "bg-gradient-to-br from-orange-500 to-orange-600", 
      icon: Newspaper,
      path: "/news", 
      roles: [] 
    },
    { 
      title: "الصلاحيات", 
      subtitle: "Permissions",
      color: "bg-gradient-to-br from-lime-500 to-lime-600", 
      icon: Lock,
      path: "/user-permissions", 
      roles: ["admin"] 
    },
    { 
      title: "سجلات المواطنين", 
      subtitle: getTicketsSubtitle('cid'),
      color: "bg-gradient-to-br from-slate-500 to-slate-600", 
      icon: Users,
      path: "/citizen-records", 
      roles: ["admin", "cybercrime"] 
    },
    { 
      title: "الحوادث والبلاغات", 
      subtitle: getTicketsSubtitle('cid'),
      color: "bg-gradient-to-br from-red-500 to-red-600", 
      icon: AlertCircle,
      path: "/incidents", 
      roles: [] 
    },
    { 
      title: "العمليات وإدارة الجهاز", 
      subtitle: "Operations",
      color: "bg-gradient-to-br from-blue-600 to-indigo-600", 
      icon: Radio,
      path: "/department/operations-system", 
      roles: ["admin", "operations_system"] 
    },
    { 
      title: "المعابر والحدود", 
      subtitle: "Borders",
      color: "bg-gradient-to-br from-teal-500 to-teal-600", 
      icon: MapPin,
      path: "/department/borders", 
      roles: ["admin", "borders"] 
    },
    { 
      title: "شرطة السياحة", 
      subtitle: "Tourism",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600", 
      icon: Palmtree,
      path: "/department/tourism", 
      roles: ["admin", "tourism_police"] 
    },
    { 
      title: "العمليات المشتركة", 
      subtitle: "Joint Ops",
      color: "bg-gradient-to-br from-purple-600 to-pink-600", 
      icon: GitBranch,
      path: "/department/joint-operations", 
      roles: ["admin", "joint_operations"] 
    },
  ];


  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-20" style={{ direction: "ltr" }}>
      {/* Header */}
      <header className="bg-white w-full p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-5">
          <button onClick={() => window.location.reload()}>
            <RotateCw className="w-7 h-7 text-[#2B9BF4]" />
          </button>
          <LoginHistoryBell />
          <NotificationBell />
          <button onClick={() => (window.location.href = "tel:100")}>
            <Phone className="w-7 h-7 text-[#2B9BF4]" />
          </button>
        </div>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-7 h-7 text-[#2B9BF4]" />
        </button>
      </header>

      {/* Welcome */}
      <div className="px-6 pt-2 pb-2 flex items-center justify-between w-full">
        <h1 className="text-xl font-medium text-gray-800">مرحباً بك، {user?.full_name || "الضابط"}</h1>
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow relative -top-1">
          <img src={policeLogo} alt="Police Logo" className="w-16 h-16 object-contain" />
        </div>
      </div>

      {/* Tickets */}
      <div className="px-4 sm:px-6 pb-3 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-[#7CB342] mb-2">Tickets</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-5">
          {tickets
            .filter(ticket => ticket.title !== "الأخبار")
            .map((ticket, index) => {
              // ✅ السماح للإدمن برؤية جميع الأقسام
              if (ticket.roles.length > 0 && user?.role !== "admin" && !hasAccess(ticket.roles as any[])) return null;

              return (
                <Card
                  key={index}
                  onClick={() => navigate(ticket.path)}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border overflow-hidden bg-white"
                >
                  <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col items-center text-center min-h-[80px] sm:min-h-[90px] md:min-h-[100px]">
                    <div className={`${ticket.color} w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center shadow-md mb-2 flex-shrink-0`}>
                      <ticket.icon className="text-white w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-bold line-clamp-2">{ticket.title}</h3>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Toggle */}
        <div className="bg-white border border-gray-300 rounded-xl p-3 flex items-center justify-between mb-4">
          <Switch
            checked={isTracking}
            onCheckedChange={handleTrackingToggle}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
          />
          <span className="text-base font-medium text-[#7CB342]">تفعيل / إيقاف تتبع الموقع GPS</span>
        </div>

        {/* Map */}
        <div className="bg-gray-200 rounded-2xl overflow-hidden mb-3 h-[350px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.0!2d35.2!3d31.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDU0JzAwLjAiTiAzNcKwMTInMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890"
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Map */}
      </div>

      {/* Floating Action Button - Quick Access */}
      <div className="fixed bottom-24 right-6 z-40">
        <Drawer>
          <DrawerTrigger asChild>
            <button className="group relative w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#689F38] rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-4 border-white">
              <Target className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{quickAccessButtons.length}</span>
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-white">
            <DrawerHeader>
              <DrawerTitle className="text-center text-2xl font-bold text-[#7CB342] flex items-center justify-center gap-2">
                <Target className="w-6 h-6" />
                الوصول السريع
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {quickAccessButtons.map((button, index) => {
                  const IconComponent = button.icon;
                  return (
                    <Card
                      key={index}
                      onClick={() => navigate(button.path)}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden animate-scale-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-0 h-24">
                        <div className={`h-full w-full bg-gradient-to-br ${button.gradient} flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300`}>
                          <IconComponent className="text-white w-8 h-8 drop-shadow-lg" />
                          <h3 className="font-bold text-xs text-white text-center px-2 drop-shadow-md line-clamp-2">
                            {button.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* News Drawer - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Drawer open={newsDrawerOpen} onOpenChange={setNewsDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="relative bg-[#2B9BF4] text-white p-4 w-full text-center hover:bg-[#1e7cc7] transition-all shadow-lg">
              <h2 className="text-xl font-bold">الأخبار</h2>
              {unreadNewsCount > 0 && (
                <Badge className="absolute top-3 right-4 h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                  {unreadNewsCount}
                </Badge>
              )}
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center text-2xl font-bold">الأخبار الداخلية</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                {newsItems.map((item, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button 
                className="w-full mt-4" 
                size="lg"
                onClick={() => {
                  setNewsDrawerOpen(false);
                  navigate('/news');
                }}
              >
                عرض جميع الأخبار
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Modern Sidebar */}
      <ModernSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </div>
  );
};

export default Dashboard;
