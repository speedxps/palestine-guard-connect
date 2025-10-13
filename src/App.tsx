import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import AccessDenied from "@/pages/AccessDenied";
import NotFound from "@/pages/NotFound";

// الأقسام
import TrafficDepartment from "@/pages/TrafficDepartment";
import SpecialPoliceDepartment from "@/pages/SpecialPoliceDepartment";
import JudicialPoliceDepartment from "@/pages/JudicialPoliceDepartment";
import AdminDepartment from "@/pages/AdminDepartment";
import CIDDepartment from "@/pages/CIDDepartment";
import CybercrimeDepartment from "@/pages/CybercrimeDepartment";

// الصفحات الإضافية
import NotificationManagement from "@/pages/NotificationManagement";
import UserPermissions from "@/pages/UserPermissions";
import PoliceNews from "@/pages/PoliceNews";
import PoliceAssistant from "@/pages/PoliceAssistant";
import CybercrimeReports from "@/pages/CybercrimeReports";
import CybercrimeAdvancedDashboard from "@/pages/CybercrimeAdvancedDashboard";
import DepartmentUsersManagement from "@/pages/DepartmentUsersManagement";
import Reports from "@/pages/Reports";
import ReportsManagement from "@/pages/ReportsManagement";
import PatrolsManagement from "@/pages/PatrolsManagement";
import Violations from "@/pages/Violations";
import ViolationsAdmin from "@/pages/ViolationsAdmin";
import WantedPersonsTree from "@/pages/WantedPersonsTree";
import Incidents from "@/pages/Incidents";
import IncidentsManagement from "@/pages/IncidentsManagement";
import DailyStats from "@/pages/DailyStats";
import SmartCivilRegistry from "@/pages/SmartCivilRegistry";
import FaceRecognition from "@/pages/FaceRecognition";
import AdvancedFaceRecognition from "@/pages/AdvancedFaceRecognition";
import Tasks from "@/pages/Tasks";
import UrgentTasks from "@/pages/UrgentTasks";
import VehicleInquiry from "@/pages/VehicleInquiry";
import VehicleManagement from "@/pages/VehicleManagement";
import SchedulingPage from "@/pages/SchedulingPage";
import JudicialCaseManagement from "@/pages/JudicialCaseManagement";
import JudicialTracking from "@/pages/JudicialTracking";
import JudicialCommunications from "@/pages/JudicialCommunications";
import ForensicLabs from "@/pages/ForensicLabs";
import Feed from "@/pages/Feed";
import About from "@/pages/About";
import AdminPanel from "@/pages/AdminPanel";
import Backup from "@/pages/Backup";
import Chat from "@/pages/Chat";
import CitizenRecords from "@/pages/CitizenRecords";
import CivilRegistry from "@/pages/CivilRegistry";

function App() {
  return (
    <Router>
      <Routes>
        {/* صفحات عامة */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />

        {/* الأقسام */}
        <Route path="/department/traffic" element={<TrafficDepartment />} />
        <Route path="/department/special-police" element={<SpecialPoliceDepartment />} />
        <Route path="/department/judicial" element={<JudicialPoliceDepartment />} />
        <Route path="/department/admin" element={<AdminDepartment />} />
        <Route path="/department/cid" element={<CIDDepartment />} />
        <Route path="/department/cybercrime" element={<CybercrimeDepartment />} />

        {/* الصفحات الخاصة */}
        <Route path="/notifications" element={<NotificationManagement />} />
        <Route path="/permissions" element={<UserPermissions />} />
        <Route path="/news" element={<PoliceNews />} />
        <Route path="/assistant" element={<PoliceAssistant />} />
        <Route path="/cybercrime/reports" element={<CybercrimeReports />} />
        <Route path="/cybercrime/dashboard" element={<CybercrimeAdvancedDashboard />} />
        <Route path="/department/users" element={<DepartmentUsersManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/management" element={<ReportsManagement />} />
        <Route path="/patrols" element={<PatrolsManagement />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/violations/admin" element={<ViolationsAdmin />} />
        <Route path="/wanted" element={<WantedPersonsTree />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/management" element={<IncidentsManagement />} />
        <Route path="/daily-stats" element={<DailyStats />} />
        <Route path="/registry/smart" element={<SmartCivilRegistry />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/face-recognition/advanced" element={<AdvancedFaceRecognition />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/urgent" element={<UrgentTasks />} />
        <Route path="/vehicles/inquiry" element={<VehicleInquiry />} />
        <Route path="/vehicles/management" element={<VehicleManagement />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/judicial/cases" element={<JudicialCaseManagement />} />
        <Route path="/judicial/tracking" element={<JudicialTracking />} />
        <Route path="/judicial/communications" element={<JudicialCommunications />} />
        <Route path="/labs" element={<ForensicLabs />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/citizen-records" element={<CitizenRecords />} />
        <Route path="/civil-registry" element={<CivilRegistry />} />
      </Routes>
    </Router>
  );
}

export default App;
