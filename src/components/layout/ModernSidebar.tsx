import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Car, 
  ShieldCheck, 
  Shield, 
  Computer,
  Newspaper,
  ChevronDown,
  ChevronUp,
  FileText,
  Settings,
  LogOut,
  Bot,
  UserCheck,
  Users,
  Scale
} from 'lucide-react';
import policeLogo from "@/assets/police-logo.png";

interface ModernSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getAccessibleDepartments, userRole } = useRoleBasedAccess();
  
  const [openDepartments, setOpenDepartments] = useState<string[]>([]);

  const toggleDepartment = (deptId: string) => {
    setOpenDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const allDepartments = [
    {
      id: 'admin',
      title: 'الإدارة العامة',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      path: '/department/admin'
    },
    {
      id: 'traffic_police',
      title: 'شرطة المرور',
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      path: '/department/traffic'
    },
    {
      id: 'cid',
      title: 'المباحث الجنائية',
      icon: ShieldCheck,
      color: 'from-red-500 to-red-600',
      path: '/department/cid'
    },
    {
      id: 'special_police',
      title: 'الشرطة الخاصة',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      path: '/department/special'
    },
    {
      id: 'cybercrime',
      title: 'الجرائم الإلكترونية',
      icon: Computer,
      color: 'from-indigo-500 to-indigo-600',
      path: '/department/cybercrime'
    },
    {
      id: 'judicial_police',
      title: 'الشرطة القضائية',
      icon: Scale,
      color: 'from-emerald-500 to-emerald-600',
      path: '/department/judicial-police'
    }
  ];

  const accessibleDepartments = getAccessibleDepartments();
  const departments = allDepartments.filter(dept => 
    accessibleDepartments.some(acc => acc.id === dept.id)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-72 bg-gradient-to-br from-gray-50 to-gray-100 p-0" style={{ direction: 'rtl' }}>
        {/* Header with Green Theme */}
        <SheetHeader className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white rounded-full p-1 shadow-xl">
              <img 
                src={policeLogo}
                alt="Palestinian Police Logo" 
                className="h-16 w-16 rounded-full object-cover border-2 border-white"
              />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mb-1 font-arabic">نظام إدارة الشرطة</h2>
          <p className="text-green-100 text-sm font-arabic">فلسطين - Palestine</p>
        </SheetHeader>

        {/* User Info */}
        <div className="p-4 bg-white mx-3 mt-3 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'مستخدم'}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold font-arabic text-lg">
                  {user?.full_name?.charAt(0) || 'م'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 font-arabic">
                {user?.full_name || 'مستخدم'}
              </h3>
              <p className="text-xs text-gray-600 font-arabic">{user?.email}</p>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 mt-1">
                {userRole === 'admin' && 'مدير النظام'}
                {userRole === 'traffic_police' && 'شرطة المرور'}
                {userRole === 'cid' && 'مباحث جنائية'}
                {userRole === 'special_police' && 'شرطة خاصة'}
                {userRole === 'cybercrime' && 'جرائم إلكترونية'}
                {userRole === 'judicial_police' && 'شرطة قضائية'}
                {userRole === 'officer' && 'ضابط'}
                {userRole === 'user' && 'مستخدم'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto sidebar-scroll p-3">
          <div className="space-y-1">
            {/* Dashboard Link */}
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 rounded-xl ${
                location.pathname === '/dashboard' 
                  ? 'bg-green-100 text-green-700 font-semibold' 
                  : 'text-gray-700 hover:bg-white'
              }`}
              onClick={() => handleNavigation('/dashboard')}
            >
              <Crown className="h-5 w-5 shrink-0" />
              <span className="font-arabic">الرئيسية</span>
            </Button>

            {/* Police Assistant Link */}
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 rounded-xl ${
                location.pathname === '/police-assistant' 
                  ? 'bg-green-100 text-green-700 font-semibold' 
                  : 'text-gray-700 hover:bg-white'
              }`}
              onClick={() => handleNavigation('/police-assistant')}
            >
              <Bot className="h-5 w-5 shrink-0" />
              <span className="font-arabic">المساعد الذكي</span>
            </Button>

            {/* News Link */}
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 rounded-xl ${
                location.pathname === '/police-news' 
                  ? 'bg-green-100 text-green-700 font-semibold' 
                  : 'text-gray-700 hover:bg-white'
              }`}
              onClick={() => handleNavigation('/police-news')}
            >
              <Newspaper className="h-5 w-5 shrink-0" />
              <span className="font-arabic">الأخبار</span>
            </Button>

            {/* Smart Civil Registry Link - Admin Only */}
            {userRole === 'admin' && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl ${
                  location.pathname === '/smart-civil-registry' 
                    ? 'bg-green-100 text-green-700 font-semibold' 
                    : 'text-gray-700 hover:bg-white'
                }`}
                onClick={() => handleNavigation('/smart-civil-registry')}
              >
                <UserCheck className="h-5 w-5 shrink-0" />
                <span className="font-arabic">السجل المدني الذكي</span>
              </Button>
            )}

            {userRole === 'admin' && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl ${
                  location.pathname === '/user-dashboard' 
                    ? 'bg-green-100 text-green-700 font-semibold' 
                    : 'text-gray-700 hover:bg-white'
                }`}
                onClick={() => handleNavigation('/user-dashboard')}
              >
                <Computer className="h-5 w-5 shrink-0" />
                <span className="font-arabic">الأجهزة</span>
              </Button>
            )}

            {userRole === 'admin' && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl ${
                  location.pathname === '/admin-panel' 
                    ? 'bg-green-100 text-green-700 font-semibold' 
                    : 'text-gray-700 hover:bg-white'
                }`}
                onClick={() => handleNavigation('/admin-panel')}
              >
                <Users className="h-5 w-5 shrink-0" />
                <span className="font-arabic">إدارة المستخدمين</span>
              </Button>
            )}

            {/* Departments */}
            {departments.length > 0 && (
              <div className="pt-3">
                <h3 className="text-xs font-bold text-gray-500 font-arabic px-3 mb-2">
                  الأقسام
                </h3>
                
                {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <Button
                        key={dept.id}
                        variant="ghost"
                        className={`w-full justify-start gap-3 mb-1 rounded-xl ${
                          location.pathname === dept.path 
                            ? 'bg-green-100 text-green-700 font-semibold' 
                            : 'text-gray-700 hover:bg-white'
                        }`}
                        onClick={() => handleNavigation(dept.path)}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${dept.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-arabic text-sm flex-1 text-right">{dept.title}</span>
                      </Button>
                    );
                  })}
              </div>
            )}

            {/* Profile Link */}
            <div className="pt-3 border-t border-gray-200 mt-3">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl ${
                  location.pathname === '/profile' 
                    ? 'bg-green-100 text-green-700 font-semibold' 
                    : 'text-gray-700 hover:bg-white'
                }`}
                onClick={() => handleNavigation('/profile')}
              >
                <Settings className="h-5 w-5 shrink-0" />
                <span className="font-arabic">الملف الشخصي</span>
              </Button>
              
              {/* Logout Button */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 mt-1 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="font-arabic">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModernSidebar;