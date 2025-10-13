import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";
import { Switch } from "@/components/ui/switch";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, RotateCw, Phone, Bell } from "lucide-react";
import policeLogo from "@/assets/police-logo.png";
import { toast } from "sonner";
import ModernSidebar from "@/components/layout/ModernSidebar";

const Dashboard = () => {
  const { user } = useAuth();
  const { hasAccess } = useRoleBasedAccess();
  const navigate = useNavigate();
  const [patrolActive, setPatrolActive] = useState(false);
  const [newsDrawerOpen, setNewsDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tickets = [
    { title: "شرطة المرور", subtitle: "0 Tickets", color: "bg-[#2B9BF4]", path: "/department/traffic", roles: ['admin', 'traffic_police'] },
    { title: "الشرطة الخاصة", subtitle: "0 Tickets", color: "bg-[#E91E63]", path: "/department/special", roles: ['admin', 'special_police'] },
    { title: "الشرطة القضائية", subtitle: "0 Tickets", color: "bg-[#4CAF50]", path: "/department/judicial-police", roles: ['admin', 'judicial_police'] },
    { title: "الإدارة العامة", subtitle: "0 Tickets", color: "bg-[#F5A623]", path: "/department/admin", roles: ['admin'] },
    {
      title: "المباحث الجنائية",
      subtitle: "0 Tickets",
      color: "bg-[#03A9F4]",
      path: "/department/cid",
      roles: ['admin', 'cid'],
    },
    {
      title: "الجرائم الإلكترونية",
      subtitle: "0 Tickets",
      color: "bg-[#00BCD4]",
      path: "/department/cybercrime",
      roles: ['admin', 'cybercrime'],
    },
    {
      title: "المساعد الذكي",
      subtitle: "0 Tickets",
      color: "bg-[#9C27B0]",
      path: "/police-assistant",
      roles: [],
    },
    { 
      title: "الأخبار", 
      subtitle: "0 Tickets", 
      color: "bg-[#FF9800]", 
      path: "/police-news", 
      roles: [] 
    },
    { 
      title: "الصلاحيات", 
      subtitle: "0 Tickets", 
      color: "bg-[#8BC34A]", 
      path: "/user-permissions", 
      roles: ['admin'] 
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
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-7 h-7 text-[#2B9BF4]" />
        </button>
        <div className="flex items-center gap-5">
          <button onClick={() => window.location.reload()}>
            <RotateCw className="w-7 h-7 text-[#2B9BF4]" />
          </button>
          <button onClick={() => toast.info("No new notifications")}>
            <Bell className="w-7 h-7 text-[#2B9BF4]" />
          </button>
          <button onClick={() => (window.location.href = "tel:100")}>
            <Phone className="w-7 h-7 text-[#2B9BF4]" />
          </button>
        </div>
      </header>

      {/* Welcome */}
      <div className="px-6 pt-2 pb-2 flex items-center justify-between w-full">
        <h1 className="text-xl font-medium text-gray-800">Welcome {user?.full_name || "Mr. Noor Arjan"}</h1>
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow relative -top-1">
          <img src={policeLogo} alt="Police Logo" className="w-16 h-16 object-contain" />
        </div>
      </div>

      {/* Tickets */}
      <div className="px-6 pb-3 w-full">
        <h2 className="text-2xl font-bold text-[#7CB342] mb-2">Tickets</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {tickets.map((ticket, index) => {
            // تحقق من صلاحية الأدوار
            if (ticket.roles.length > 0 && !hasAccess(ticket.roles as any[])) return null;

            return (
              <div
                key={index}
                onClick={() => navigate(ticket.path)}
                className={`${ticket.color} rounded-xl p-2 flex flex-col items-center justify-center text-white min-h-[70px] shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all`}
              >
                <h3 className="font-bold text-base leading-tight text-center">{ticket.title}</h3>
                <p className="text-xs opacity-90 mt-0.5">{ticket.subtitle}</p>
              </div>
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
            <button className="bg-[#7CB342] text-white rounded-t-2xl p-3 w-full text-center hover:bg-[#6aa23b] transition-colors">
              <h2 className="text-2xl font-bold">News</h2>
            </button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[80vh] rounded-t-3xl" style={{ direction: "rtl" }}>
            <DrawerHeader className="border-b">
              <DrawerTitle className="text-2xl font-bold text-[#2B9BF4]">الأخبار</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {newsItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{item.description}</p>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                ))}
              </div>
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
