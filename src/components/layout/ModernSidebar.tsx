import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  AlertTriangle,
  Plus,
  Users,
  Eye,
  CheckSquare,
  Rss,
  MessageCircle,
  BarChart3,
  Menu,
  LogOut,
  Bot,
  UserCheck
} from 'lucide-react';

interface ModernSidebarProps {
  onClose?: () => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getAccessibleDepartments, userRole } = useRoleBasedAccess();
  
  const [openDepartments, setOpenDepartments] = useState<string[]>(['current']);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      path: '/department/judicial-police'
    }
  ];

  const accessibleDepartments = getAccessibleDepartments();
  const departments = allDepartments.filter(dept => 
    accessibleDepartments.some(acc => acc.id === dept.id)
  );


  return (
    <div className="h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-sm w-72 flex flex-col">
      {/* Close button for mobile */}
      {onClose && (
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-primary/10 text-primary"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* Header with Integrated Logo & Menu */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-5 w-5 object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 font-arabic">نظام إدارة الشرطة</h2>
              <p className="text-xs text-gray-600 font-arabic">فلسطين - Palestine</p>
            </div>
          </div>
          {!onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shrink-0 hover:bg-primary/10 text-primary"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name || 'مستخدم'}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold font-arabic">
                {user?.full_name?.charAt(0) || 'م'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 font-arabic text-sm">
              {user?.full_name || 'مستخدم'}
            </h3>
            <Badge variant="secondary" className="text-xs bg-white text-gray-700">
              {userRole === 'admin' && 'مدير النظام'}
              {userRole === 'traffic_police' && 'شرطة المرور'}
              {userRole === 'cid' && 'مباحث جنائية'}
              {userRole === 'special_police' && 'شرطة خاصة'}
              {userRole === 'cybercrime' && 'جرائم إلكترونية'}
              {userRole === 'officer' && 'ضابط'}
              {userRole === 'user' && 'مستخدم'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="p-4 space-y-2">
          {/* Dashboard Link */}
          <Button
            variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${
              location.pathname === '/dashboard' 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => navigate('/dashboard')}
          >
            <Crown className="h-4 w-4 shrink-0" />
            <span className="font-arabic">الرئيسية</span>
          </Button>

          {/* Police News Link */}
          <Button
            variant={location.pathname === '/police-news' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${
              location.pathname === '/police-news' 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => navigate('/police-news')}
          >
            <Newspaper className="h-4 w-4 shrink-0" />
            <span className="font-arabic">أخبار الشرطة</span>
          </Button>

          {/* Police Assistant Link */}
          <Button
            variant={location.pathname === '/police-assistant' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${
              location.pathname === '/police-assistant' 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => navigate('/police-assistant')}
          >
            <Bot className="h-4 w-4 shrink-0" />
            <span className="font-arabic">المساعد الذكي</span>
          </Button>

          {/* Smart Civil Registry Link - Admin Only */}
          {userRole === 'admin' && (
            <Button
              variant={location.pathname === '/smart-civil-registry' ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                location.pathname === '/smart-civil-registry' 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => navigate('/smart-civil-registry')}
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="font-arabic">السجل المدني الذكي</span>
            </Button>
          )}


          {/* Departments */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-gray-600 font-arabic px-2 mb-2">
              الأقسام
            </h3>
            
            {departments.map((dept) => {
                const Icon = dept.icon;
                return (
                  <Button
                    key={dept.id}
                    variant={location.pathname === dept.path ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 mb-1 ${
                      location.pathname === dept.path 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => navigate(dept.path)}
                  >
                    <div className={`p-1.5 rounded-md bg-gradient-to-r ${dept.color}`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-arabic text-sm flex-1 text-right">{dept.title}</span>
                  </Button>
                );
              })}
          </div>

          {/* Profile Link */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Button
              variant={location.pathname === '/profile' ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                location.pathname === '/profile' 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="font-arabic">الملف الشخصي</span>
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 mt-2"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="font-arabic">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;