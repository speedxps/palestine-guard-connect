import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/components/LanguageProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import AccessDenied from "@/components/AccessDenied";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Tasks from "./pages/Tasks";
import Chat from "./pages/Chat";
import NewIncident from "./pages/NewIncident";
import Profile from "./pages/Profile";
import Cybercrime from "./pages/Cybercrime";
import CybercrimeReports from "./pages/CybercrimeReports";
import Feed from "./pages/Feed";
import Patrol from "./pages/Patrol";
import NotFound from "./pages/NotFound";
import Violations from "./pages/Violations";
import ViolationsAdmin from "./pages/ViolationsAdmin";
import Backup from "./pages/Backup";
import WantedPersonsTree from "./pages/WantedPersonsTree";
import IncidentsManagement from "./pages/IncidentsManagement";
import CitizenRecords from "./pages/CitizenRecords";
import About from "./pages/About";
import FaceRecognition from "./pages/FaceRecognition";
import PoliceNews from "./pages/PoliceNews";
import Reports from "./pages/Reports";
import ReportsManagement from "./pages/ReportsManagement";
import AdminPanel from "./pages/AdminPanel";
import CybercrimeAdvanced from "./pages/CybercrimeAdvanced";
import CybercrimeAdvancedDashboard from "./pages/CybercrimeAdvancedDashboard";
import VehicleInquiry from "./pages/VehicleInquiry";
import VehicleManagement from "./pages/VehicleManagement";
import PatrolsManagement from "./pages/PatrolsManagement";
import AdminDepartment from "./pages/AdminDepartment";
import TrafficDepartment from "./pages/TrafficDepartment";
import CIDDepartment from "./pages/CIDDepartment";
import SpecialPoliceDepartment from "./pages/SpecialPoliceDepartment";
import CybercrimeDepartment from "./pages/CybercrimeDepartment";
import UserDashboard from "./pages/UserDashboard";
import DailyStats from "./pages/DailyStats";
import UrgentTasks from "./pages/UrgentTasks";
import SchedulingPage from "./pages/SchedulingPage";
import ActivityDetail from "./pages/ActivityDetail";
import PoliceAssistant from "./pages/PoliceAssistant";
import CivilRegistry from "./pages/CivilRegistry";
import SmartCivilRegistry from "./pages/SmartCivilRegistry";
import AdvancedFaceRecognition from "./pages/AdvancedFaceRecognition";
import EmergencyNotificationSystem from "./components/EmergencyNotificationSystem";

const queryClient = new QueryClient();

const App = () => {
  // Set default light mode for professional appearance
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Ensure RTL direction
    document.documentElement.dir = 'rtl';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } />
                <Route path="/police-news" element={
                  <ProtectedRoute>
                    <PoliceNews />
                  </ProtectedRoute>
                } />
                <Route path="/activity/:id/:type" element={
                  <ProtectedRoute>
                    <ActivityDetail />
                  </ProtectedRoute>
                } />
                <Route path="/daily-stats" element={
                  <ProtectedRoute>
                    <DailyStats />
                  </ProtectedRoute>
                } />
                <Route path="/urgent-tasks" element={
                  <ProtectedRoute>
                    <UrgentTasks />
                  </ProtectedRoute>
                } />
                <Route path="/scheduling" element={
                  <ProtectedRoute>
                    <SchedulingPage />
                  </ProtectedRoute>
                } />
                <Route path="/activity/:id/:type" element={
                  <ProtectedRoute>
                    <ActivityDetail />
                  </ProtectedRoute>
                } />
                
                {/* Admin Panel */}
                <Route path="/admin-panel" element={
                  <RoleBasedRoute requiredPage="admin-panel">
                    <AdminPanel />
                  </RoleBasedRoute>
                } />
                
                {/* Traffic Police Routes */}
                <Route path="/violations" element={
                  <RoleBasedRoute requiredPage="violations">
                    <Violations />
                  </RoleBasedRoute>
                } />
                <Route path="/violations-admin" element={
                  <RoleBasedRoute requiredPage="violations-admin">
                    <ViolationsAdmin />
                  </RoleBasedRoute>
                } />
                <Route path="/vehicle-inquiry" element={
                  <RoleBasedRoute requiredPage="vehicle-lookup">
                    <VehicleInquiry />
                  </RoleBasedRoute>
                } />
                <Route path="/vehicle-management" element={
                  <RoleBasedRoute requiredPage="violations-admin">
                    <VehicleManagement />
                  </RoleBasedRoute>
                } />
                <Route path="/patrols-management" element={
                  <RoleBasedRoute requiredPage="patrol">
                    <PatrolsManagement />
                  </RoleBasedRoute>
                } />
                
                {/* CID Routes */}
                <Route path="/incidents" element={
                  <RoleBasedRoute requiredPage="incidents">
                    <Incidents />
                  </RoleBasedRoute>
                } />
                <Route path="/incidents-management" element={
                  <RoleBasedRoute requiredPage="incidents-management">
                    <IncidentsManagement />
                  </RoleBasedRoute>
                } />
                <Route path="/new-incident" element={
                  <RoleBasedRoute requiredPage="new-incident">
                    <NewIncident />
                  </RoleBasedRoute>
                } />
                <Route path="/wanted-persons-tree" element={
                  <RoleBasedRoute requiredPage="wanted-persons-tree">
                    <WantedPersonsTree />
                  </RoleBasedRoute>
                } />
        <Route path="/civil-registry" element={
          <ProtectedRoute>
            <CivilRegistry />
          </ProtectedRoute>
        } />
        <Route path="/smart-civil-registry" element={
          <RoleBasedRoute requiredPage="citizen-records">
            <SmartCivilRegistry />
          </RoleBasedRoute>
        } />
        <Route path="/advanced-face-recognition" element={
          <RoleBasedRoute requiredPage="citizen-records">
            <AdvancedFaceRecognition />
          </RoleBasedRoute>
        } />
        <Route path="/face-recognition" element={
          <ProtectedRoute>
            <FaceRecognition />
          </ProtectedRoute>
        } />
                
                {/* Special Police Routes */}
                <Route path="/tasks" element={
                  <RoleBasedRoute requiredPage="tasks">
                    <Tasks />
                  </RoleBasedRoute>
                } />
                <Route path="/patrol" element={
                  <RoleBasedRoute requiredPage="patrol">
                    <Patrol />
                  </RoleBasedRoute>
                } />
                <Route path="/feed" element={
                  <RoleBasedRoute requiredPage="feed">
                    <Feed />
                  </RoleBasedRoute>
                } />
                <Route path="/chat" element={
                  <RoleBasedRoute requiredPage="chat">
                    <Chat />
                  </RoleBasedRoute>
                } />
                
                {/* Cybercrime Routes */}
                <Route path="/cybercrime" element={
                  <RoleBasedRoute requiredPage="cybercrime">
                    <Cybercrime />
                  </RoleBasedRoute>
                } />
                <Route path="/cybercrime-reports" element={
                  <RoleBasedRoute requiredPage="cybercrime-reports">
                    <CybercrimeReports />
                  </RoleBasedRoute>
                } />
                <Route path="/reports" element={
                  <RoleBasedRoute requiredPage="reports">
                    <Reports />
                  </RoleBasedRoute>
                } />
                <Route path="/reports-management" element={
                  <ProtectedRoute>
                    <ReportsManagement />
                  </ProtectedRoute>
                } />
                
                {/* Admin Only Routes */}
                <Route path="/backup" element={
                  <RoleBasedRoute requiredPage="backup">
                    <Backup />
                  </RoleBasedRoute>
                } />
                <Route path="/citizen-records" element={
                  <RoleBasedRoute requiredPage="citizen-records">
                    <CitizenRecords />
                  </RoleBasedRoute>
                } />
                
                {/* Advanced Cybercrime System */}
                <Route path="/cybercrime-advanced" element={
                  <RoleBasedRoute requiredPage="cybercrime-advanced">
                    <CybercrimeAdvanced />
                  </RoleBasedRoute>
                } />
                <Route path="/cybercrime-dashboard" element={
                  <RoleBasedRoute requiredPage="cybercrime">
                    <CybercrimeAdvancedDashboard />
                  </RoleBasedRoute>
                } />
                
                {/* Department Pages */}
                <Route path="/department/admin" element={
                  <RoleBasedRoute requiredPage="admin-panel">
                    <AdminDepartment />
                  </RoleBasedRoute>
                } />
                <Route path="/department/traffic" element={
                  <RoleBasedRoute requiredPage="violations">
                    <TrafficDepartment />
                  </RoleBasedRoute>
                } />
                <Route path="/department/cid" element={
                  <RoleBasedRoute requiredPage="incidents">
                    <CIDDepartment />
                  </RoleBasedRoute>
                } />
                <Route path="/department/special" element={
                  <RoleBasedRoute requiredPage="tasks">
                    <SpecialPoliceDepartment />
                  </RoleBasedRoute>
                } />
                <Route path="/department/cybercrime" element={
                  <RoleBasedRoute requiredPage="cybercrime">
                    <CybercrimeDepartment />
                  </RoleBasedRoute>
                } />
                
                {/* User Dashboard */}
                <Route path="/user-dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Police Assistant */}
                <Route path="/police-assistant" element={
                  <ProtectedRoute>
                    <PoliceAssistant />
                  </ProtectedRoute>
                } />
                
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <EmergencyNotificationSystem />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
