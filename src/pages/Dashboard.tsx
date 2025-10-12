import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Menu, RotateCw, Phone, Bell, Crown, Car, Shield, Scale, Laptop, Bot, Users, Calendar } from "lucide-react";
import policeLogo from "@/assets/police-logo.png";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const { hasAccess } = useRoleBasedAccess();
  const navigate = useNavigate();
  const [patrolActive, setPatrolActive] = useState(false);
  const [newsDrawerOpen, setNewsDrawerOpen] = useState(false);

  const tickets = [
    {
      title: "الإدارة العامة",
      subtitle: "لوحات الإدارة والتحكم في النظام",
      icon: Crown,
      color: "bg-[#2B9BF4]",
      path: "/department/admin",
      roles: ["admin"],
    },
    {
      title: "شرطة المرور",
      subtitle: "إدارة حركة المرور والمخالفات",
      icon: Car,
      color: "bg-[#2B9BF4]",
      path: "/department/traffic",
      roles: ["admin", "traffic_police"],
    },
    {
      title: "الشرطة الخاصة",
      subtitle: "العمليات الخاصة والأمنية",
      icon: Shield,
      color: "bg-[#2B9BF4]",
      path: "/department/special",
      roles: ["admin", "special_police"],
    },
    {
      title: "المباحث الجنائية",
      subtitle: "التحقيق في الجرائم ومعالجة الأدلة",
      icon: Shield,
      color: "bg-[#2B9BF4]",
      path: "/department/cid",
      roles: ["admin", "cid"],
    },
    {
      title: "الشرطة القضائية",
      subtitle: "الشؤون القضائية والقانونية",
      icon: Scale,
      color: "bg-[#2B9BF4]",
      path: "/department/judicial-police",
      roles: ["admin", "judicial_police"],
    },
    {
      title: "الجرائم الإلكترونية",
      subtitle: "مكافحة الجرائم الإلكترونية والأمن السيبراني",
      icon: Laptop,
      color: "bg-[#2B9BF4]",
      path: "/department/cybercrime",
      roles: ["admin", "cybercrime"],
    },
    {
      title: "المساعد الذكي",
      subtitle: "مساعد ذكي للاستفسارات والدعم",
      icon: Bot,
      color: "bg-[#2B9BF4]",
      path: "/police-assistant",
      roles: [],
    },
    {
      title: "صلاحيات المستخدم",
      subtitle: "إدارة صلاحيات المستخدمين",
      icon: Shield,
      color: "bg-[#2B9BF4]",
      path: "/user-permissions",
      roles: ["admin"],
    },
    {
      title: "إدارة المستخدمين",
      subtitle: "إدارة حسابات المستخدمين",
      icon: Users,
      color: "bg-[#2B9BF4]",
      path: "/admin-panel",
      roles: ["admin"],
    },
    {
      title: "جدولة",
      subtitle: "جدولة المواعيد والمهام",
      icon: Calendar,
      color: "bg-[#2B9BF4]",
      path: "/scheduling",
      roles: [],
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
    <div className="min-h-screen bg-white" style={{ direction: "rtl" }}>
      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/profile")}>
            <Menu className="w-8 h-8 text-gray-800" />
          </button>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => toast.info("لا توجد إشعارات جديدة")}>
            <Bell className="w-8 h-8 text-[#2B9BF4]" />
          </button>
          <button onClick={() => (window.location.href = "tel:100")}>
            <Phone className="w-8 h-8 text-[#2B9BF4]" />
          </button>
          <button onClick={() => window.location.reload()}>
            <RotateCw className="w-8 h-8 text-[#2B9BF4]" />
          </button>
        </div>
      </header>

      {/* Welcome section with logo */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-800">Welcome {user?.full_name || "Mr. Noor Arjan"}</h1>
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg relative -top-2">
          <img src={policeLogo} alt="Palestinian Police" className="w-28 h-28 object-contain" />
        </div>
      </div>

      {/* Tickets section */}
      <div className="px-6 pb-6">
        <h2 className="text-4xl font-bold text-[#2B9BF4] mb-4">Tickets</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              onClick={() => navigate(ticket.path)}
              className={`${ticket.color} text-white rounded-xl p-3 flex flex-col items-end gap-1 min-h-[90px] shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all`}
            >
              <ticket.icon className="w-10 h-10 mb-1" strokeWidth={2} />
              <div className="text-right">
                <h3 className="font-bold text-base leading-tight">{ticket.title}</h3>
                {ticket.subtitle && <p className="text-xs opacity-90 mt-0.5 leading-tight">{ticket.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Patrol toggle */}
        <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 flex items-center justify-between mb-6">
          <Switch
            checked={patrolActive}
            onCheckedChange={setPatrolActive}
            className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-400"
          />
          <span className="text-xl font-medium text-[#2B9BF4]">تفعيل / إيقاف عمل الدورية</span>
        </div>

        {/* Google Maps */}
        <div className="bg-gray-200 rounded-2xl overflow-hidden mb-4 h-[450px] relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.0!2d35.2!3d31.9"
            className="w-full h-full"
            style={{ border: 0, filter: "grayscale(0.3)" }}
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* News button */}
        <button
          onClick={() => setNewsDrawerOpen(true)}
          className="bg-[#2B9BF4] text-white rounded-t-2xl p-4 w-full text-center hover:bg-[#2B9BF4]/90 transition-colors"
        >
          <h2 className="text-3xl font-bold">News</h2>
        </button>
      </div>

      {/* News Drawer */}
      <Drawer open={newsDrawerOpen} onOpenChange={setNewsDrawerOpen}>
        <DrawerContent className="max-h-[80vh]" style={{ direction: "rtl" }}>
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
  );
};

export default Dashboard;
