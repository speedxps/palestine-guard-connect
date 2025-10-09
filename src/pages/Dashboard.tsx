import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import PoliceNews from '@/components/dashboard/PoliceNews';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Shield, 
  Users,
  Bot,
  RefreshCw,
  Phone,
  Bell,
  MapPin,
  Mail,
  Newspaper,
  Car,
  Scale,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import genericPoliceLogo from '@/assets/generic-police-logo.png';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="space-y-6" dir="rtl">
        {/* Profile Header Section */}
        <Card className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center relative">
            <div className="absolute top-4 left-4 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 p-0"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 p-0"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 p-0"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>

            <h2 className="text-green-100 text-lg mb-2">User Profile</h2>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-1 shadow-xl">
                <img 
                  src={genericPoliceLogo} 
                  alt="Profile" 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white"
                />
              </div>
            </div>

            <h1 className="text-white text-3xl font-bold mb-2">
              {user?.full_name || 'مستخدم'}
            </h1>
            
            <div className="flex justify-center items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Phone className="h-5 w-5 text-white" />
                <span className="text-white font-medium">0594606294</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Mail className="h-5 w-5 text-white" />
                <span className="text-white font-medium">police@ps.gov</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tickets/Departments Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="h-7 w-7 text-green-600" />
            الأقسام والخدمات
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Traffic Police */}
            <Card
              onClick={() => navigate('/department/traffic')}
              className="bg-gradient-to-br from-blue-400 to-blue-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Car className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  شرطة المرور
                </h3>
              </div>
            </Card>

            {/* Special Police */}
            <Card
              onClick={() => navigate('/department/special-police')}
              className="bg-gradient-to-br from-purple-400 to-purple-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  الشرطة الخاصة
                </h3>
              </div>
            </Card>

            {/* Judicial Police */}
            <Card
              onClick={() => navigate('/department/judicial-police')}
              className="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Scale className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  الشرطة القضائية
                </h3>
              </div>
            </Card>

            {/* Admin Department */}
            <Card
              onClick={() => navigate('/department/admin')}
              className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  الإدارة العامة
                </h3>
              </div>
            </Card>

            {/* CID */}
            <Card
              onClick={() => navigate('/department/cid')}
              className="bg-gradient-to-br from-red-400 to-red-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  المباحث الجنائية
                </h3>
              </div>
            </Card>

            {/* Cybercrime */}
            <Card
              onClick={() => navigate('/department/cybercrime')}
              className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Laptop className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  الجرائم الإلكترونية
                </h3>
              </div>
            </Card>

            {/* Police Tech */}
            <Card
              onClick={() => navigate('/police-assistant')}
              className="bg-gradient-to-br from-pink-400 to-pink-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Bot className="h-8 w-8 text-pink-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  المساعد الذكي
                </h3>
              </div>
            </Card>

            {/* News */}
            <Card
              onClick={() => navigate('/police-news')}
              className="bg-gradient-to-br from-teal-400 to-teal-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Newspaper className="h-8 w-8 text-teal-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  الأخبار
                </h3>
              </div>
            </Card>

            {/* Devices */}
            <Card
              onClick={() => navigate('/user-dashboard')}
              className="bg-gradient-to-br from-lime-400 to-lime-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Laptop className="h-8 w-8 text-lime-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  الأجهزة
                </h3>
              </div>
            </Card>

            {/* Users Management */}
            <Card
              onClick={() => navigate('/admin-panel')}
              className="bg-gradient-to-br from-violet-400 to-violet-500 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-0"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/90 rounded-full p-4 shadow-md">
                  <Users className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  إدارة المستخدمين
                </h3>
              </div>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-green-600" />
            الخريطة التفاعلية
          </h3>
          <Card className="bg-white rounded-2xl shadow-lg overflow-hidden h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.0!2d35.2!3d31.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDU0JzAwLjAiTiAzNcKwMTInMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </Card>
        </div>

        {/* News Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-green-600" />
            آخر الأخبار
          </h3>
          <Card className="bg-white rounded-2xl shadow-lg p-6">
            <PoliceNews />
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;