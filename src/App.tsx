import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/components/LanguageProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import PagePermissionRoute from "@/components/PagePermissionRoute";
import AccessDenied from "@/pages/AccessDenied";
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
import OverviewPage from './pages/OverviewPage';
import DepartmentUserManagement from './pages/DepartmentUserManagement';
import DepartmentUsersManagement from './pages/DepartmentUsersManagement';
import AdminPanel from "./pages/AdminPanel";

// Department user management wrappers
const DepartmentUserManagementTraffic = () => <DepartmentUserManagement department="traffic" />;
const DepartmentUserManagementCID = () => <DepartmentUserManagement department="cid" />;
const DepartmentUserManagementSpecial = () => <DepartmentUserManagement department="special" />;
const DepartmentUserManagementCybercrime = () => <DepartmentUserManagement department="cybercrime" />;
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
import ForensicLabs from "./pages/ForensicLabs";
import JudicialCaseManagement from "./pages/JudicialCaseManagement";
import JudicialCommunications from "./pages/JudicialCommunications";
import JudicialTracking from "./pages/JudicialTracking";
import JudicialPoliceDepartment from "./pages/JudicialPoliceDepartment";

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
                <Route path="/access-denied" element={<AccessDenied />} />
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
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </RoleBasedRoute>
                } />
                
                {/* Traffic Police Routes */}
                <Route path="/violations" element={
                  <ProtectedRoute>
                    <Violations />
                  </ProtectedRoute>
                } />
                <Route path="/violations-admin" element={
                  <RoleBasedRoute allowedRoles={['admin', 'traffic_police']}>
                    <ViolationsAdmin />
                  </RoleBasedRoute>
                } />
                <Route path="/vehicle-inquiry" element={
                  <ProtectedRoute>
                    <VehicleInquiry />
                  </ProtectedRoute>
                } />
                <Route path="/vehicle-management" element={
                  <RoleBasedRoute allowedRoles={['admin', 'traffic_police']}>
                    <VehicleManagement />
                  </RoleBasedRoute>
                } />
                <Route path="/patrols-management" element={
                  <ProtectedRoute>
                    <PatrolsManagement />
                  </ProtectedRoute>
                } />
                
                {/* CID Routes */}
                <Route path="/incidents" element={
                  <ProtectedRoute>
                    <Incidents />
                  </ProtectedRoute>
                } />
                <Route path="/incidents-management" element={
                  <ProtectedRoute>
                    <IncidentsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/new-incident" element={
                  <ProtectedRoute>
                    <NewIncident />
                  </ProtectedRoute>
                } />
                <Route path="/wanted-persons-tree" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cid', 'cybercrime']}>
                    <WantedPersonsTree />
                  </RoleBasedRoute>
                } />
        <Route path="/civil-registry" element={
          <ProtectedRoute>
            <CivilRegistry />
          </ProtectedRoute>
        } />
        <Route path="/smart-civil-registry" element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <SmartCivilRegistry />
          </RoleBasedRoute>
        } />
        <Route path="/advanced-face-recognition" element={
          <RoleBasedRoute allowedRoles={['admin', 'cid', 'cybercrime']}>
            <AdvancedFaceRecognition />
          </RoleBasedRoute>
        } />
        <Route path="/face-recognition" element={
          <RoleBasedRoute allowedRoles={['admin', 'cid', 'cybercrime']}>
            <FaceRecognition />
          </RoleBasedRoute>
        } />
                
                {/* Special Police Routes */}
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } />
                <Route path="/patrol" element={
                  <ProtectedRoute>
                    <Patrol />
                  </ProtectedRoute>
                } />
                <Route path="/feed" element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                
                {/* Cybercrime Routes */}
                <Route path="/cybercrime" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cybercrime']}>
                    <Cybercrime />
                  </RoleBasedRoute>
                } />
                <Route path="/cybercrime-reports" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cybercrime']}>
                    <CybercrimeReports />
                  </RoleBasedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/reports-management" element={
                  <ProtectedRoute>
                    <ReportsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/overview" element={
                  <ProtectedRoute>
                    <OverviewPage />
                  </ProtectedRoute>
                } />
                <Route path="/department-users/traffic" element={
                  <ProtectedRoute>
                    <DepartmentUserManagementTraffic />
                  </ProtectedRoute>
                } />
                <Route path="/department-users/cid" element={
                  <ProtectedRoute>
                    <DepartmentUserManagementCID />
                  </ProtectedRoute>
                } />
                <Route path="/department-users/special" element={
                  <ProtectedRoute>
                    <DepartmentUserManagementSpecial />
                  </ProtectedRoute>
                } />
                <Route path="/department-users/cybercrime" element={
                  <ProtectedRoute>
                    <DepartmentUserManagementCybercrime />
                  </ProtectedRoute>
                } />
                
                {/* Admin Only Routes */}
                <Route path="/backup" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <Backup />
                  </RoleBasedRoute>
                } />
                <Route path="/citizen-records" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cid', 'cybercrime']}>
                    <CitizenRecords />
                  </RoleBasedRoute>
                } />
                
                {/* Advanced Cybercrime System */}
                <Route path="/cybercrime-advanced" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cybercrime']}>
                    <CybercrimeAdvanced />
                  </RoleBasedRoute>
                } />
                <Route path="/cybercrime-dashboard" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cybercrime']}>
                    <CybercrimeAdvancedDashboard />
                  </RoleBasedRoute>
                } />
                
                {/* Department Pages */}
                <Route path="/department/admin" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDepartment />
                  </RoleBasedRoute>
                } />
                <Route path="/department/traffic" element={
                  <RoleBasedRoute allowedRoles={['admin', 'traffic_police']}>
                    <PagePermissionRoute>
                      <TrafficDepartment />
                    </PagePermissionRoute>
                  </RoleBasedRoute>
                } />
                <Route path="/department/traffic/users" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <DepartmentUsersManagement department="traffic" />
                  </RoleBasedRoute>
                } />
                <Route path="/department/cid" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cid']}>
                    <PagePermissionRoute>
                      <CIDDepartment />
                    </PagePermissionRoute>
                  </RoleBasedRoute>
                } />
                <Route path="/department/cid/users" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <DepartmentUsersManagement department="cid" />
                  </RoleBasedRoute>
                } />
                <Route path="/forensic-labs" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cid']}>
                    <ForensicLabs />
                  </RoleBasedRoute>
                } />
                
                <Route path="/department/judicial-police" element={
                  <ProtectedRoute>
                    <JudicialPoliceDepartment />
                  </ProtectedRoute>
                } />
                <Route path="/judicial-case-management" element={
                  <ProtectedRoute>
                    <JudicialCaseManagement />
                  </ProtectedRoute>
                } />
                <Route path="/judicial-communications" element={
                  <ProtectedRoute>
                    <JudicialCommunications />
                  </ProtectedRoute>
                } />
                <Route path="/judicial-tracking" element={
                  <ProtectedRoute>
                    <JudicialTracking />
                  </ProtectedRoute>
                } />
                
                <Route path="/department/special" element={
                  <RoleBasedRoute allowedRoles={['admin', 'special_police']}>
                    <PagePermissionRoute>
                      <SpecialPoliceDepartment />
                    </PagePermissionRoute>
                  </RoleBasedRoute>
                } />
                <Route path="/department/special/users" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <DepartmentUsersManagement department="special" />
                  </RoleBasedRoute>
                } />
                <Route path="/department/cybercrime" element={
                  <RoleBasedRoute allowedRoles={['admin', 'cybercrime']}>
                    <PagePermissionRoute>
                      <CybercrimeDepartment />
                    </PagePermissionRoute>
                  </RoleBasedRoute>
                } />
                <Route path="/department/cybercrime/users" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <DepartmentUsersManagement department="cybercrime" />
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
