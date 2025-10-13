import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTabbed } from "@/components/UserManagementTabbed";
import UserManagementProfessional from "@/components/UserManagementProfessional";
import { BackButton } from "@/components/BackButton";
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
  CheckSquare,
} from "lucide-react";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const adminSections = [
    { id: "overview", title: "نظرة عامة", icon: BarChart3, color: "bg-blue-500" },
    { id: "user-management", title: "إدارة المستخدمين", icon: Users, color: "bg-green-500" },
    { id: "traffic-management", title: "المرور", icon: Car, color: "bg-yellow-500" },
    { id: "cid-management", title: "المباحث", icon: Eye, color: "bg-red-500" },
    { id: "special-management", title: "الشرطة الخاصة", icon: Shield, color: "bg-purple-500" },
    { id: "system-settings", title: "إعدادات النظام", icon: Settings, color: "bg-gray-500" },
  ];

  const systemStats = [
    { label: "المستخدمين", value: "0", icon: Users, color: "text-blue-500" },
    { label: "البلاغات", value: "0", icon: AlertTriangle, color: "text-red-500" },
    { label: "المهام", value: "0", icon: FileText, color: "text-green-500" },
    { label: "الدوريات", value: "0", icon: UserCheck, color: "text-purple-500" },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-arabic">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-arabic">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant="outline"
              className={`flex flex-col items-center justify-center p-2 rounded-lg hover:shadow-md ${section.color} text-white`}
              onClick={() => setActiveTab(section.id)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-arabic">{section.title}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <Card className="p-6 space-y-4">
      <div className="p-4 border rounded-lg">
        <h4 className="font-semibold font-arabic">النسخ الاحتياطي</h4>
        <Button variant="outline" size="sm" className="mt-2">
          <Database className="h-4 w-4 mr-1" />
          إنشاء نسخة احتياطية
        </Button>
      </div>
      <div className="p-4 border rounded-lg">
        <h4 className="font-semibold font-arabic">تنظيف النظام</h4>
        <Button variant="outline" size="sm" className="mt-2">
          <Settings className="h-4 w-4 mr-1" />
          تنظيف النظام
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BackButton to="/dashboard" />
          <h1 className="text-xl font-bold font-arabic">لوحة تحكم الإدارة</h1>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-arabic text-gray-700">مرحباً، {user?.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-gray-100 p-2 rounded-lg">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center p-2 text-xs font-arabic"
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {section.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="user-management">
            <Card className="p-2">
              <UserManagementProfessional />
              <UserManagementTabbed />
            </Card>
          </TabsContent>
          <TabsContent value="system-settings">{renderSystemSettings()}</TabsContent>
          {/* باقي الأقسام يمكن إضافتها بنفس النمط */}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
