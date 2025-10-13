import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Shield,
  Settings,
  FileText,
  Key,
  UserCheck,
  Home,
  User,
  Database,
  BarChart3,
  AlertTriangle,
  Car,
  Eye,
  MessageCircle,
  CheckSquare,
} from "lucide-react";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const adminSections = [
    { id: "overview", title: "نظرة عامة", icon: BarChart3, color: "bg-blue-500" },
    { id: "user-management", title: "إدارة المستخدمين", icon: Users, color: "bg-green-500" },
    { id: "traffic-management", title: "شرطة المرور", icon: Car, color: "bg-yellow-500" },
    { id: "cid-management", title: "المباحث الجنائية", icon: Eye, color: "bg-red-500" },
    { id: "special-management", title: "الشرطة الخاصة", icon: Shield, color: "bg-purple-500" },
    { id: "system-settings", title: "إعدادات النظام", icon: Settings, color: "bg-gray-500" },
  ];

  const systemStats = [
    { label: "إجمالي المستخدمين", value: "0", icon: Users, color: "text-blue-600" },
    { label: "البلاغات النشطة", value: "0", icon: AlertTriangle, color: "text-red-600" },
    { label: "المهام قيد التنفيذ", value: "0", icon: FileText, color: "text-green-600" },
    { label: "الدوريات النشطة", value: "0", icon: UserCheck, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-arabic text-gray-800">لوحة تحكم الإدارة</h1>
          <p className="text-sm text-gray-500">مرحباً، {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <Home className="h-4 w-4 mr-1" />
            الرئيسية
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <User className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {adminSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex flex-col items-center p-3 gap-1 bg-white rounded shadow hover:shadow-lg transition"
              >
                <section.icon className={`h-6 w-6 text-white ${section.color} rounded p-1`} />
                <span className="text-xs font-arabic text-gray-700">{section.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemStats.map((stat, i) => (
                <Card key={i} className="p-4 flex items-center gap-3 bg-white rounded shadow">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other Tabs Placeholder */}
          <TabsContent value="user-management">
            <Card className="p-6">إدارة المستخدمين</Card>
          </TabsContent>
          <TabsContent value="traffic-management">
            <Card className="p-6">شرطة المرور</Card>
          </TabsContent>
          <TabsContent value="cid-management">
            <Card className="p-6">المباحث الجنائية</Card>
          </TabsContent>
          <TabsContent value="special-management">
            <Card className="p-6">الشرطة الخاصة</Card>
          </TabsContent>
          <TabsContent value="system-settings">
            <Card className="p-6">إعدادات النظام</Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
