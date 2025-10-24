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
import ProfileWithHistory from "@/pages/ProfileWithHistory";
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
import DepartmentTasks from "@/pages/DepartmentTasks";
import Patrol from "@/pages/Patrol";
import Feed from "@/pages/Feed";
import Chat from "@/pages/Chat";
import Cybercrime from "@/pages/Cybercrime";
import CybercrimeReports from "@/pages/CybercrimeReports";
import Reports from "@/pages/Reports";
import ReportsManagement from "@/pages/ReportsManagement";
import OverviewPage from "@/pages/OverviewPage";
import Backup from "@/pages/Backup";
import CitizenRecords from "@/pages/CitizenRecords";
import CybercrimeAdvanced from "@/pages/CybercrimeAdvanced";
import CybercrimeAdvancedCaseDetail from "@/pages/CybercrimeAdvancedCaseDetail";
import CybercrimeAdvancedDashboard from "@/pages/CybercrimeAdvancedDashboard";
import CybercrimeSecurityReport from "@/pages/CybercrimeSecurityReport";
import CybercrimeTrendAnalysis from "@/pages/CybercrimeTrendAnalysis";
import AdminDepartment from "@/pages/AdminDepartment";
import TrafficDepartment from "@/pages/TrafficDepartment";
import CIDDepartment from "@/pages/CIDDepartment";
import SpecialPoliceDepartment from "@/pages/SpecialPoliceDepartment";
import CybercrimeDepartment from "@/pages/CybercrimeDepartment";
import OperationsSystemDepartment from "@/pages/OperationsSystemDepartment";
import BordersDepartment from "@/pages/BordersDepartment";
import TourismPoliceDepartment from "@/pages/TourismPoliceDepartment";
import JointOperationsDepartment from "@/pages/JointOperationsDepartment";
import JointOpsCoordination from "@/pages/JointOpsCoordination";
import JointOpsOperations from "@/pages/JointOpsOperations";
import JointOpsCommandCenter from "@/pages/JointOpsCommandCenter";
import JointOpsSharedFiles from "@/pages/JointOpsSharedFiles";
import JointOpsHotlines from "@/pages/JointOpsHotlines";
import JointOpsMonitoring from "@/pages/JointOpsMonitoring";
import JointOpsTraining from "@/pages/JointOpsTraining";
import SecurityAgency from "@/pages/SecurityAgency";
import UserDashboard from "@/pages/UserDashboard";
import PoliceAssistant from "@/pages/PoliceAssistant";
import ForensicLabs from "@/pages/ForensicLabs";
import JudicialCaseManagement from "@/pages/JudicialCaseManagement";
import JudicialCommunications from "@/pages/JudicialCommunications";
import JudicialTracking from "@/pages/JudicialTracking";
import JudicialPoliceDepartment from "@/pages/JudicialPoliceDepartment";
import JudicialPoliceUsers from "@/pages/JudicialPoliceUsers";
import JudicialCaseSearch from "@/pages/JudicialCaseSearch";
import TrafficPoliceUsers from "@/pages/TrafficPoliceUsers";
import CIDUsers from "@/pages/CIDUsers";
import SpecialPoliceUsers from "@/pages/SpecialPoliceUsers";
import CybercrimeUsers from "@/pages/CybercrimeUsers";
import TrafficCitizenRecord from "@/pages/TrafficCitizenRecord";
import TrafficCitizenSearch from "@/pages/TrafficCitizenSearch";
import CIDSuspectRecord from "@/pages/CIDSuspectRecord";
import CIDSuspectSearch from "@/pages/CIDSuspectSearch";
import JudicialCaseRecord from "@/pages/JudicialCaseRecord";
import NotificationManagement from "@/pages/NotificationManagement";
import UserPermissions from "@/pages/UserPermissions";
import NotFound from "@/pages/NotFound";
import AccessDenied from "@/pages/AccessDenied";
import SetupTestUsers from "@/pages/SetupTestUsers";
import CreateUser from "@/pages/CreateUser";
import Tickets from "@/pages/Tickets";
import InternalNews from "@/pages/InternalNews";
import InvestigationClosureManagement from "@/pages/InvestigationClosureManagement";
import ExternalAccessManagement from "@/pages/ExternalAccessManagement";
import AgencyCommunications from "@/pages/AgencyCommunications";
import AgencyDetail from "@/pages/AgencyDetail";
import TourismSites from "@/pages/TourismSites";
import TourismAssistance from "@/pages/TourismAssistance";
import BordersMonitoring from "@/pages/BordersMonitoring";
import BordersDatabase from "@/pages/BordersDatabase";
import BordersPermits from "@/pages/BordersPermits";
import LiveTracking from "@/pages/LiveTracking";
import UserLocationMap from "@/pages/UserLocationMap";
import InterDepartmentCommunication from "@/pages/InterDepartmentCommunication";

const queryClient = new QueryClient();

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
                <Route path="/department/traffic/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "traffic_police"]}><TrafficPoliceUsers /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/cid/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "cid"]}><CIDUsers /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/special/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "special_police"]}><SpecialPoliceUsers /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/cybercrime/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "cybercrime"]}><CybercrimeUsers /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/judicial-police/users" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "judicial_police"]}><JudicialPoliceUsers /></RoleBasedRoute></ProtectedRoute>} />

              {/* Citizen Record Pages */}
              <Route path="/department/traffic/citizen-search" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "traffic_police"]}><TrafficCitizenSearch /></RoleBasedRoute></ProtectedRoute>} />
              <Route path="/department/traffic/citizen-record/:id" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "traffic_police"]}><TrafficCitizenRecord /></RoleBasedRoute></ProtectedRoute>} />
              <Route path="/department/cid/suspect-search" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "cid"]}><CIDSuspectSearch /></RoleBasedRoute></ProtectedRoute>} />
              <Route path="/department/cid/suspect-record/:id" element={<ProtectedRoute><RoleBasedRoute allowedRoles={["admin", "cid"]}><CIDSuspectRecord /></RoleBasedRoute></ProtectedRoute>} />

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
                  path="/investigation-closure-management"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <InvestigationClosureManagement />
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
                      <ProfileWithHistory />
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
                
                <Route
                  path="/admin/live-tracking"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <LiveTracking />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/user-location-map"
                  element={
                    <ProtectedRoute>
                      <UserLocationMap />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/inter-department-communication"
                  element={
                    <ProtectedRoute>
                      <InterDepartmentCommunication />
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
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <IncidentsManagement />
                      </RoleBasedRoute>
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

                {/* Tasks Management - Admin Only */}
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <Tasks />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Department Tasks - All Departments */}
                <Route
                  path="/department-tasks"
                  element={
                    <ProtectedRoute>
                      <DepartmentTasks />
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
                      <TrafficPoliceUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-users/cid"
                  element={
                    <ProtectedRoute>
                      <CIDUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-users/special"
                  element={
                    <ProtectedRoute>
                      <SpecialPoliceUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-users/cybercrime"
                  element={
                    <ProtectedRoute>
                      <CybercrimeUsers />
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
                  path="/cybercrime-advanced-case-detail"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeAdvancedCaseDetail />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybercrime-security-report"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeSecurityReport />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybercrime-trend-analysis"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeTrendAnalysis />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/external-access-management"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <ExternalAccessManagement />
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
                <Route
                  path="/cybercrime-security-report"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeSecurityReport />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybercrime-trend-analysis"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "cybercrime"]}>
                        <CybercrimeTrendAnalysis />
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
                  path="/department/operations-system"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "operations_system"]}>
                        <OperationsSystemDepartment />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/borders"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "borders"]}>
                        <BordersDepartment />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/tourism"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "tourism_police"]}>
                        <TourismPoliceDepartment />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/joint-operations"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOperationsDepartment />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                {/* Joint Operations Sub-pages */}
                <Route
                  path="/joint-ops/coordination"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsCoordination />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/operations"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsOperations />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/command-center"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsCommandCenter />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/shared-files"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsSharedFiles />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/hotlines"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsHotlines />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/monitoring"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsMonitoring />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/training"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <JointOpsTraining />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/agency-communications"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <AgencyCommunications />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/joint-ops/agency/:slug"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <AgencyDetail />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route path="/department/tourism/sites" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['admin', 'tourism_police']}><TourismSites /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/tourism/assistance" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['admin', 'tourism_police']}><TourismAssistance /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/borders/monitoring" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['admin', 'borders']}><BordersMonitoring /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/borders/database" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['admin', 'borders']}><BordersDatabase /></RoleBasedRoute></ProtectedRoute>} />
                <Route path="/department/borders/permits" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['admin', 'borders']}><BordersPermits /></RoleBasedRoute></ProtectedRoute>} />
                <Route
                  path="/security-agency/:agencyId"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "joint_operations"]}>
                        <SecurityAgency />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/department/judicial-police/case-search"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "judicial_police"]}>
                        <JudicialCaseSearch />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department/judicial-police/case-record/:id"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={["admin", "judicial_police"]}>
                        <JudicialCaseRecord />
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
