import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Shield,
  Settings,
  FileText,
  Key,
  UserCheck,
  BarChart3,
  Car,
  AlertTriangle,
  Eye,
  CheckSquare,
  Home,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const sections = [
    { id: "overview", title: "نظرة عامة", icon: BarChart3, route: "/dashboard" },
    { id: "users", title: "إدارة المستخدمين", icon: Users, route: "/users-management" },
    { id: "traffic", title: "المرور", icon: Car, route: "/violations-admin" },
    { id: "cid", title: "المباحث الجنائية", icon: Eye, route: "/incidents-management" },
    { id: "special", title: "الشرطة الخاصة", icon: Shield, route: "/tasks" },
    { id: "settings", title: "إعدادات النظام", icon: Settings, route: "/backup" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white font-arabic">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-blue-900/70 backdrop-blur-md border-b border-blue-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton to="/dashboard" />
          <h1 className="text-lg font-bold">لوحة تحكم الإدارة</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">مرحباً، {user?.name || "المسؤول"}</span>
          <Button
            onClick={() => navigate("/profile")}
            className="rounded-full bg-blue-800 hover:bg-blue-700 text-white h-8 w-8 flex items-center justify-center"
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              onClick={() => navigate(section.route)}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-b from-blue-800 to-blue-900 border border-blue-700 rounded-2xl flex flex-col items-center justify-center p-4 text-center"
            >
              <div className="bg-blue-700 p-3 rounded-xl mb-2 shadow-md">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-semibold tracking-wide">{section.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Overview Section */}
      {activeTab === "overview" && (
        <div className="mt-10 px-6">
          <h2 className="text-lg font-semibold mb-4">ملخص الأداء</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "إجمالي المستخدمين", value: "124", icon: Users },
              { label: "البلاغات النشطة", value: "32", icon: AlertTriangle },
              { label: "المهام الحالية", value: "14", icon: CheckSquare },
              { label: "الدوريات", value: "8", icon: Shield },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={i}
                  className="bg-blue-800/50 border border-blue-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs opacity-80 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <div className="bg-blue-700/80 p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
