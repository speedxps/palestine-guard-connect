import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTicketsCount } from "@/hooks/useTicketsCount";
import { Switch } from "@/components/ui/switch";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, RotateCw, Phone, Badge as BadgeIcon } from "lucide-react";
import policeLogo from "@/assets/police-logo.png";
import ModernSidebar from "@/components/layout/ModernSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const { hasAccess } = useRoleBasedAccess();
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const { ticketsCounts } = useTicketsCount();
  const [patrolActive, setPatrolActive] = useState(false);
  const [newsDrawerOpen, setNewsDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);

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
        .select('id')
        .eq('is_published', true);

      if (!allNews) return;

      // Get news that user has read
      const { data: readNews } = await supabase
        .from('news_reads')
        .select('news_id')
        .eq('user_id', user.id);

      const readNewsIds = readNews?.map(r => r.news_id) || [];
      const unreadCount = allNews.filter(n => !readNewsIds.includes(n.id)).length;
      
      setUnreadNewsCount(unreadCount);
    } catch (error) {
      console.error('Error fetching unread news count:', error);
    }
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
      color: "bg-[#2B9BF4]",
      path: "/department/traffic",
      roles: ["admin", "traffic_police"],
    },
    {
      title: "الشرطة الخاصة",
      subtitle: getTicketsSubtitle('special_police'),
      color: "bg-[#E91E63]",
      path: "/department/special",
      roles: ["admin", "special_police"],
    },
    {
      title: "الشرطة القضائية",
      subtitle: getTicketsSubtitle('judicial_police'),
      color: "bg-[#4CAF50]",
      path: "/department/judicial-police",
      roles: ["admin", "judicial_police"],
    },
    {
      title: "الإدارة العامة",
      subtitle: getTicketsSubtitle('admin'),
      color: "bg-[#F5A623]",
      path: "/department/admin",
      roles: ["admin"],
    },
    {
      title: "المباحث الجنائية",
      subtitle: getTicketsSubtitle('cid'),
      color: "bg-[#03A9F4]",
      path: "/department/cid",
      roles: ["admin", "cid"],
    },
    {
      title: "الجرائم الإلكترونية",
      subtitle: getTicketsSubtitle('cybercrime'),
      color: "bg-[#00BCD4]",
      path: "/department/cybercrime",
      roles: ["admin", "cybercrime"],
    },
    { 
      title: "المساعد الذكي", 
      subtitle: "AI Assistant",
      color: "bg-[#9C27B0]", 
      path: "/police-assistant", 
      roles: [] 
    },
    { 
      title: "الأخبار", 
      subtitle: "News",
      color: "bg-[#FF9800]", 
      path: "/news", 
      roles: [] 
    },
    { 
      title: "الصلاحيات", 
      subtitle: "Permissions",
      color: "bg-[#8BC34A]", 
      path: "/user-permissions", 
      roles: ["admin"] 
    },
    { 
      title: "سجلات المواطنين", 
      subtitle: getTicketsSubtitle('cid'),
      color: "bg-[#607D8B]", 
      path: "/citizen-records", 
      roles: ["admin", "cybercrime"] 
    },
    { 
      title: "الحوادث والبلاغات", 
      subtitle: getTicketsSubtitle('cid'),
      color: "bg-[#FF5722]", 
      path: "/incidents", 
      roles: [] 
    },
  ];

  const newsItems = [
    {
      title: "إطلاق حملة مرورية جديدة في المدينة",
      description: "تفاصيل وجدول الحملة المرورية الجديدة للحد من المخالفات...",
      time: "منذ 10 دقائق",
    },
    {
      title: "تحديث: نظام التعرف على الوجه",
      description: "تم تحديث نظام التعرف على الوجه بأحدث تقنيات الذكاء الاصطناعي...",
      time: "منذ ساعة",
    },
    {
      title: "اجتماع تنسيقي بين الأقسام",
      description: "اجتماع دوري لتنسيق العمل بين جميع أقسام الشرطة غداً الساعة 10 صباحاً...",
      time: "منذ ساعتين",
    },
    {
      title: "تدريب جديد على نظام PoliceOps",
      description: "سيتم عقد دورة تدريبية شاملة على استخدام نظام PoliceOps الأسبوع القادم...",
      time: "منذ 3 ساعات",
    },
    {
      title: "إنجازات القسم لهذا الشهر",
      description: "تقرير شامل بالإنجازات والإحصائيات الشهرية لجميع الأقسام...",
      time: "منذ 5 ساعات",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center" style={{ direction: "ltr" }}>
      {/* Header */}
      <header className="bg-white w-full p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-5">
          <button onClick={() => window.location.reload()}>
            <RotateCw className="w-7 h-7 text-[#2B9BF4]" />
          </button>
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
      <div className="px-6 pb-3 w-full">
        <h2 className="text-2xl font-bold text-[#7CB342] mb-2">Tickets</h2>
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-5">
          {tickets.map((ticket, index) => {
            // ✅ السماح للإدمن برؤية جميع الأقسام
            if (ticket.roles.length > 0 && user?.role !== "admin" && !hasAccess(ticket.roles as any[])) return null;

            return (
              <Card
                key={index}
                onClick={() => navigate(ticket.path)}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[120px]">
                  <div className={`${ticket.color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
                    <span className="text-white text-2xl">📋</span>
                  </div>
                  <h3 className="font-bold text-base leading-tight text-center text-foreground">{ticket.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{ticket.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Toggle */}
        <div className="bg-white border border-gray-300 rounded-xl p-3 flex items-center justify-between mb-4">
          <Switch
            checked={patrolActive}
            onCheckedChange={setPatrolActive}
            className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-400"
          />
          <span className="text-base font-medium text-[#7CB342]">تفعيل / إيقاف عمل الدورية</span>
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

        {/* News Drawer */}
        <Drawer open={newsDrawerOpen} onOpenChange={setNewsDrawerOpen}>
          <DrawerTrigger asChild>
            <button 
              className="relative bg-[#7CB342] text-white rounded-t-2xl p-3 w-full text-center hover:bg-[#6aa23b] transition-colors"
              onClick={() => navigate('/news')}
            >
              <h2 className="text-2xl font-bold">الأخبار</h2>
              {unreadNewsCount > 0 && (
                <Badge className="absolute top-2 right-4 h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                  {unreadNewsCount}
                </Badge>
              )}
            </button>
          </DrawerTrigger>
        </Drawer>
      </div>

      {/* Modern Sidebar */}
      <ModernSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </div>
  );
};

export default Dashboard;
