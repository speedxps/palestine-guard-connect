import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Scale,
  Bell
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
    setShowLogoutDialog(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-80 bg-white p-0 overflow-y-auto" style={{ direction: 'rtl' }}>
          {/* Header with Blue Theme */}
          <SheetHeader className="bg-gradient-to-r from-[#2B9BF4] to-blue-500 p-6 text-center border-b-4 border-[#7CB342]">
            <div className="flex justify-center mb-3">
              <div className="bg-white rounded-full p-2 shadow-2xl">
                <img 
                  src={policeLogo}
                  alt="Palestinian Police Logo" 
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-white text-2xl font-extrabold mb-1" style={{ fontStyle: 'italic' }}>
              PoliceOps
            </h2>
            <p className="text-blue-100 text-sm font-arabic">نظام إدارة الشرطة الفلسطينية</p>
          </SheetHeader>

          {/* User Info */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 mx-4 mt-4 rounded-xl shadow-lg border border-blue-100">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name || 'مستخدم'}
                  className="w-14 h-14 rounded-full object-cover border-3 border-[#2B9BF4] shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2B9BF4] to-[#7CB342] flex items-center justify-center shadow-md">
                  <span className="text-white font-bold font-arabic text-xl">
                    {user?.full_name?.charAt(0) || 'م'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 font-arabic text-lg">
                  {user?.full_name || 'مستخدم'}
                </h3>
                <p className="text-xs text-gray-600 font-arabic">{user?.email}</p>
                <Badge className="text-xs bg-[#7CB342] text-white mt-1 border-0">
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {/* Dashboard Link */}
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                  location.pathname === '/dashboard' 
                    ? 'bg-[#2B9BF4] text-white font-bold shadow-lg' 
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
                onClick={() => handleNavigation('/dashboard')}
              >
                <Crown className="h-6 w-6 shrink-0" />
                <span className="font-arabic text-lg">الرئيسية</span>
              </Button>

              {/* Police Assistant Link */}
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                  location.pathname === '/police-assistant' 
                    ? 'bg-[#7CB342] text-white font-bold shadow-lg' 
                    : 'text-gray-700 hover:bg-green-50'
                }`}
                onClick={() => handleNavigation('/police-assistant')}
              >
                <Bot className="h-6 w-6 shrink-0" />
                <span className="font-arabic text-lg">المساعد الذكي</span>
              </Button>

              {/* News Link */}
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                  location.pathname === '/news' || location.pathname.startsWith('/news/')
                    ? 'bg-[#2B9BF4] text-white font-bold shadow-lg' 
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
                onClick={() => handleNavigation('/news')}
              >
                <Newspaper className="h-6 w-6 shrink-0" />
                <span className="font-arabic text-lg">الأخبار</span>
              </Button>

              {/* Admin Only Links */}
              {userRole === 'admin' && (
                <>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                      location.pathname === '/smart-civil-registry' 
                        ? 'bg-purple-500 text-white font-bold shadow-lg' 
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                    onClick={() => {
                      handleNavigation('/smart-civil-registry');
                      onOpenChange(false);
                    }}
                  >
                    <UserCheck className="h-6 w-6 shrink-0" />
                    <span className="font-arabic text-lg">السجل المدني الذكي</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                      location.pathname === '/user-dashboard' 
                        ? 'bg-indigo-500 text-white font-bold shadow-lg' 
                        : 'text-gray-700 hover:bg-indigo-50'
                    }`}
                    onClick={() => handleNavigation('/user-dashboard')}
                  >
                    <Computer className="h-6 w-6 shrink-0" />
                    <span className="font-arabic text-lg">الأجهزة</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                      location.pathname === '/admin-panel' 
                        ? 'bg-orange-500 text-white font-bold shadow-lg' 
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                    onClick={() => handleNavigation('/admin-panel')}
                  >
                    <Users className="h-6 w-6 shrink-0" />
                    <span className="font-arabic text-lg">إدارة المستخدمين</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                      location.pathname === '/notification-management' 
                        ? 'bg-pink-500 text-white font-bold shadow-lg' 
                        : 'text-gray-700 hover:bg-pink-50'
                    }`}
                    onClick={() => handleNavigation('/notification-management')}
                  >
                    <Bell className="h-6 w-6 shrink-0" />
                    <span className="font-arabic text-lg">إدارة الإشعارات</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                      location.pathname === '/news-management' 
                        ? 'bg-teal-500 text-white font-bold shadow-lg' 
                        : 'text-gray-700 hover:bg-teal-50'
                    }`}
                    onClick={() => handleNavigation('/news-management')}
                  >
                    <Newspaper className="h-6 w-6 shrink-0" />
                    <span className="font-arabic text-lg">إدارة الأخبار</span>
                  </Button>
                </>
              )}

              {/* Departments */}
              {departments.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-gray-600 font-arabic px-3 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    الأقسام
                  </h3>
                  
                  {departments.map((dept) => {
                      const Icon = dept.icon;
                      const isOpen = openDepartments.includes(dept.id);
                      const isActive = location.pathname.startsWith(dept.path);
                      
                      const deptPages = [
                        { path: dept.path, label: 'الرئيسية' },
                        { path: `/chat/${dept.id}`, label: 'المحادثات' }
                      ];
                      
                      return (
                        <div key={dept.id} className="mb-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              className={`flex-1 justify-start gap-3 rounded-xl py-6 transition-all ${
                                isActive
                                  ? 'bg-gradient-to-r ' + dept.color + ' text-white font-bold shadow-lg' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => handleNavigation(dept.path)}
                            >
                              <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gradient-to-r ' + dept.color}`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-arabic text-base flex-1 text-right">{dept.title}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                              onClick={() => toggleDepartment(dept.id)}
                            >
                              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          {isOpen && (
                            <div className="mr-6 mt-1 space-y-1">
                              {deptPages.map((page) => (
                                <Button
                                  key={page.path}
                                  variant="ghost"
                                  className={`w-full justify-start gap-2 rounded-lg py-3 text-sm ${
                                    location.pathname === page.path
                                      ? 'bg-gray-200 text-gray-900 font-semibold'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleNavigation(page.path)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="font-arabic">{page.label}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Profile & Logout */}
              <div className="pt-4 border-t-2 border-gray-200 mt-4">
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 rounded-xl py-6 transition-all ${
                    location.pathname === '/profile' 
                      ? 'bg-gray-700 text-white font-bold shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-6 w-6 shrink-0" />
                  <span className="font-arabic text-lg">الملف الشخصي</span>
                </Button>
                
                {/* Logout Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 mt-2 rounded-xl py-6 transition-all"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="h-6 w-6 shrink-0" />
                  <span className="font-arabic text-lg">تسجيل الخروج</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent style={{ direction: 'rtl' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">تأكيد تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ModernSidebar;