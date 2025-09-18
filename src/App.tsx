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
import CybercrimeAccessManagement from "./components/CybercrimeAccessManagement";
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
import PoliceNews from "./pages/PoliceNews";
import VehicleLookup from "./pages/VehicleLookup";
import FaceRecognition from "./pages/FaceRecognition";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import CybercrimeAdvanced from "./pages/CybercrimeAdvanced";
import UserDashboard from "./pages/UserDashboard";
import EmergencyNotificationSystem from "./components/EmergencyNotificationSystem";

const queryClient = new QueryClient();

const App = () => {
  // Set default dark mode for better UI
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
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
                <Route path="/police-news" element={
                  <ProtectedRoute>
                    <PoliceNews />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute>
                    <About />
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
                <Route path="/vehicle-lookup" element={
                  <RoleBasedRoute requiredPage="vehicle-lookup">
                    <VehicleLookup />
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
                <Route path="/face-recognition" element={
                  <RoleBasedRoute requiredPage="face-recognition">
                    <FaceRecognition />
                  </RoleBasedRoute>
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
                <Route path="/cybercrime-access" element={
                  <RoleBasedRoute requiredPage="cybercrime">
                    <CybercrimeAccessManagement />
                  </RoleBasedRoute>
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
                
                {/* User Dashboard */}
                <Route path="/user-dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
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
