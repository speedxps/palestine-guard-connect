import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UsersManagement from "@/pages/DepartmentUsersManagement";
import Tickets from "@/pages/Tickets";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import NotificationManagement from "@/pages/NotificationManagement";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import CyberCrimes from "@/pages/CyberCrimes";
import SmartAssistant from "@/pages/SmartAssistant";
import News from "@/pages/News";
import TrafficPolice from "@/pages/TrafficPolice";
import SpecialPolice from "@/pages/SpecialPolice";
import JudicialPolice from "@/pages/JudicialPolice";
import GeneralAdministration from "@/pages/GeneralAdministration";
import CriminalInvestigation from "@/pages/CriminalInvestigation";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route path="/" element={<Login />} />

          {/* لوحة التحكم الرئيسية */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* إدارة المستخدمين - للمشرفين فقط */}
          <Route
            path="/users-management"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <UsersManagement />
              </RoleBasedRoute>
            }
          />

          {/* إدارة التذاكر */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />

          {/* إدارة الإشعارات - للمشرفين فقط ✅ (تم تعديلها لتعمل) */}
          <Route
            path="/notification-management"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <NotificationManagement />
              </RoleBasedRoute>
            }
          />

          {/* باقي الصفحات العامة */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cyber-crimes"
            element={
              <ProtectedRoute>
                <CyberCrimes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/smart-assistant"
            element={
              <ProtectedRoute>
                <SmartAssistant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            }
          />

          {/* أقسام الشرطة */}
          <Route
            path="/traffic-police"
            element={
              <ProtectedRoute>
                <TrafficPolice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/special-police"
            element={
              <ProtectedRoute>
                <SpecialPolice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/judicial-police"
            element={
              <ProtectedRoute>
                <JudicialPolice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/general-administration"
            element={
              <ProtectedRoute>
                <GeneralAdministration />
              </ProtectedRoute>
            }
          />

          <Route
            path="/criminal-investigation"
            element={
              <ProtectedRoute>
                <CriminalInvestigation />
              </ProtectedRoute>
            }
          />

          {/* صفحة الخطأ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
