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
import EmergencyNotificationSystem from "@/components/EmergencyNotificationSystem";

// Pages
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import News from "@/pages/News";
import NewsManagementPage from "@/pages/NewsManagementPage";
import ActivityDetail from "@/pages/ActivityDetail";
import DailyStats from "@/pages/DailyStats";
import UrgentTasks from "@/pages/UrgentTasks";
import SchedulingPage from "@/pages/SchedulingPage";
import AdminPanel from "@/pages/AdminPanel";
import Violations from "@/pages/Violations";
import ViolationsAdmin from "@/pages/ViolationsAdmin";
import VehicleInquiry from "@/pages/VehicleInquiry";
import VehicleManagement from "@/pages/VehicleManagement";
import PatrolsManagement from "@/pages/PatrolsManagement";
import Incidents from "@/pages/Incidents";
import IncidentsManagement from "@/pages/IncidentsManagement";
import NewIncident from "@/pages/NewIncident";
import WantedPersonsTree from "@/pages/WantedPersonsTree";
import CivilRegistry from "@/pages/CivilRegistry";
import SmartCivilRegistry from "@/pages/SmartCivilRegistry";
import AdvancedFaceRecognition from "@/pages/AdvancedFaceRecognition";
import FaceRecognition from "@/pages/FaceRecognition";
import Tasks from "@/pages/Tasks";
import Patrol from "@/pages/Patrol";
import Feed from "@/pages/Feed";
import Chat from "@/pages/Chat";
import Cybercrime from "@/pages/Cybercrime";
import CybercrimeReports from "@/pages/CybercrimeReports";
import Reports from "@/pages/Reports";
import ReportsManagement from "@/pages/ReportsManagement";
import OverviewPage from "@/pages/OverviewPage";
import DepartmentUserManagement from "@/pages/DepartmentUserManagement";
import DepartmentUsersManagement from "@/pages/DepartmentUsersManagement";
import Backup from "@/pages/Backup";
import CitizenRecords from "@/pages/CitizenRecords";
import CybercrimeAdvanced from "@/pages/CybercrimeAdvanced";
import CybercrimeAdvancedDashboard from "@/pages/CybercrimeAdvancedDashboard";
import AdminDepartment from "@/pages/AdminDepartment";
import TrafficDepartment from "@/pages/TrafficDepartment";
import CIDDepartment from "@/pages/CIDDepartment";
import SpecialPoliceDepartment from "@/pages/SpecialPoliceDepartment";
import CybercrimeDepartment from "@/pages/CybercrimeDepartment";
import UserDashboard from "@/pages/UserDashboard";
import PoliceAssistant from "@/pages/PoliceAssistant";
import ForensicLabs from "@/pages/ForensicLabs";
import JudicialCaseManagement from "@/pages/JudicialCaseManagement";
import JudicialCommunications from "@/pages/JudicialCommunications";
import JudicialTracking from "@/pages/JudicialTracking";
import JudicialPoliceDepartment from "@/pages/JudicialPoliceDepartment";
import JudicialPoliceUsers from "@/pages/JudicialPoliceUsers";
import NotificationManagement from "@/pages/NotificationManagement";
import UserPermissions from "@/pages/UserPermissions";
import NotFound from "@/pages/NotFound";
import AccessDenied from "@/pages/AccessDenied";
import SetupTestUsers from "@/pages/SetupTestUsers";
import CreateUser from "@/pages/CreateUser";
import Tickets from "@/pages/Tickets";
import InternalNews from "@/pages/InternalNews";

const queryClient = new QueryClient();

// Department user management wrappers
const DepartmentUserManagementTraffic = () => <DepartmentUserManagement department="traffic" />;
const DepartmentUserManagementCID = () => <DepartmentUserManagement department="cid" />;
const DepartmentUserManagementSpecial = () => <DepartmentUserManagement department="special" />;
const DepartmentUserManagementCybercrime = () => <DepartmentUserManagement department="cybercrime" />;

const App = () => {
  React.useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.dir = "rtl";
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
                <Route path="/setup-test-users" element={<SetupTestUsers />} />
                <Route path="/access-denied" element={
                  <ProtectedRoute>
                    <AccessDenied />
                  </ProtectedRoute>
                } />

                {/* Department User Management Routes */}
                <Route path="/department/traffic/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "traffic_police"]}><DepartmentUserManagementTraffic /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/cid/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "cid"]}><DepartmentUserManagementCID /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/special/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "special_police"]}><DepartmentUserManagementSpecial /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/cybercrime/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "cybercrime"]}><DepartmentUserManagementCybercrime /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/judicial-police/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "judicial_police"]}><JudicialPoliceUsers /></RoleBasedRoute></ProtectedRoute>} />

                {/* Notification & Permissions - Admin */}
                <Route
                  path="/notification-management"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <NotificationManagement />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-permissions"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <UserPermissions />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Dashboard & Profile */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <ProtectedRoute>
                      <About />
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
                <Route
                  path="/news/:id"
                  element={
                    <ProtectedRoute>
                      <News />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/news-management"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <NewsManagementPage />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity/:id/:type"
                  element={
                    <ProtectedRoute>
                      <ActivityDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/daily-stats"
                  element={
                    <ProtectedRoute>
                      <DailyStats />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/urgent-tasks"
                  element={
                    <ProtectedRoute>
                      <UrgentTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scheduling"
                  element={
                    <ProtectedRoute>
                      <SchedulingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Panel */}
                <Route
                  path="/admin-panel"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <AdminPanel />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                
                {/* Create User */}
                <Route
                  path="/create-user"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <CreateUser />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Traffic */}
                <Route
                  path="/violations"
                  element={
                    <ProtectedRoute>
                      <Violations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/violations-admin"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "traffic_police"]}>
                        <ViolationsAdmin />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicle-inquiry"
                  element={
                    <ProtectedRoute>
                      <VehicleInquiry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicle-management"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "traffic_police"]}>
                        <VehicleManagement />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patrols-management"
                  element={
                    <ProtectedRoute>
                      <PatrolsManagement />
                    </ProtectedRoute>
                  }
                />

                {/* CID */}
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute>
                      <Incidents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents-management"
                  element={
                    <ProtectedRoute>
                      <IncidentsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/new-incident"
                  element={
                    <ProtectedRoute>
                      <NewIncident />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wanted-persons-tree"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cid", "cybercrime"]}>
                        <WantedPersonsTree />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Civil Registry */}
                <Route
                  path="/civil-registry"
                  element={
                    <ProtectedRoute>
                      <CivilRegistry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/smart-civil-registry"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <SmartCivilRegistry />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advanced-face-recognition"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cid", "cybercrime"]}>
                        <AdvancedFaceRecognition />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/face-recognition"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cid", "cybercrime"]}>
                        <FaceRecognition />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Special Police */}
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patrol"
                  element={
                    <ProtectedRoute>
                      <Patrol />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feed"
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/internal-news"
                  element={
                    <ProtectedRoute>
                      <InternalNews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <ProtectedRoute>
                      <Tickets />
                    </ProtectedRoute>
                  }
                />

                {/* Cybercrime */}
                <Route
                  path="/cybercrime"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <Cybercrime />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybercrime-reports"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeReports />
                      </RoleBasedRoute>
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
                  path="/reports-management"
                  element={
                    <ProtectedRoute>
                      <ReportsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/overview"
                  element={
                    <ProtectedRoute>
                      <OverviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Department Users */}
                <Route
                  path="/department-users/traffic"
                  element={
                    <ProtectedRoute>
                      <DepartmentUserManagementTraffic />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-users/cid"
                  element={
                    <ProtectedRoute>
                      <DepartmentUserManagementCID />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-users/special"
                  element={
                    <ProtectedRoute>
                      <DepartmentUserManagementSpecial />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-users/cybercrime"
                  element={
                    <ProtectedRoute>
                      <DepartmentUserManagementCybercrime />
                    </ProtectedRoute>
                  }
                />

                {/* Backup / Citizen Records */}
                <Route
                  path="/backup"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <Backup />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen-records"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cid", "cybercrime"]}>
                        <CitizenRecords />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Advanced Cybercrime */}
                <Route
                  path="/cybercrime-advanced"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeAdvanced />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybercrime-dashboard"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeAdvancedDashboard />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Department Pages */}
                <Route
                  path="/department/admin"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <AdminDepartment />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/traffic"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "traffic_police"]}>
                        <PagePermissionRoute>
                          <TrafficDepartment />
                        </PagePermissionRoute>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/cid"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cid"]}>
                        <PagePermissionRoute>
                          <CIDDepartment />
                        </PagePermissionRoute>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/forensic-labs"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cid"]}>
                        <ForensicLabs />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/special"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "special_police"]}>
                        <PagePermissionRoute>
                          <SpecialPoliceDepartment />
                        </PagePermissionRoute>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/cybercrime"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <PagePermissionRoute>
                          <CybercrimeDepartment />
                        </PagePermissionRoute>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/judicial-police"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "judicial_police"]}>
                        <JudicialPoliceDepartment />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/judicial-case-management"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "judicial_police"]}>
                        <JudicialCaseManagement />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/judicial-communications"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "judicial_police"]}>
                        <JudicialCommunications />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/judicial-tracking"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "judicial_police"]}>
                        <JudicialTracking />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* User Dashboard & Assistant */}
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/police-assistant"
                  element={
                    <ProtectedRoute>
                      <PoliceAssistant />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
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
