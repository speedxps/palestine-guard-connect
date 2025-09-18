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
  Menu
} from 'lucide-react';

const ModernSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { userRole, hasAccess } = useRoleBasedAccess();
  
  const [openDepartments, setOpenDepartments] = useState<string[]>(['current']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleDepartment = (deptId: string) => {
    setOpenDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const departments = [
    {
      id: 'admin',
      title: 'الإدارة العامة',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      visible: userRole === 'admin',
      pages: [
        { title: 'لوحة الإدارة', path: '/admin-panel', icon: Settings, page: 'admin-panel' },
        { title: 'إدارة المستخدمين', path: '/admin-panel', icon: Users, page: 'admin-panel' },
        { title: 'النسخ الاحتياطي', path: '/backup', icon: Settings, page: 'backup' },
        { title: 'سجل المواطنين', path: '/citizen-records', icon: Users, page: 'citizen-records' }
      ]
    },
    {
      id: 'traffic_police',
      title: 'شرطة المرور',
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      visible: userRole === 'admin' || userRole === 'traffic_police',
      pages: [
        { title: 'المخالفات', path: '/violations', icon: FileText, page: 'violations' },
        { title: 'إدارة المخالفات', path: '/violations-admin', icon: Settings, page: 'violations-admin' },
        { title: 'البحث عن مركبة', path: '/vehicle-lookup', icon: Car, page: 'vehicle-lookup' },
        { title: 'الدوريات', path: '/patrol', icon: Users, page: 'patrol' }
      ]
    },
    {
      id: 'cid',
      title: 'المباحث الجنائية',
      icon: ShieldCheck,
      color: 'from-red-500 to-red-600',
      visible: userRole === 'admin' || userRole === 'cid',
      pages: [
        { title: 'البلاغات', path: '/incidents', icon: AlertTriangle, page: 'incidents' },
        { title: 'إدارة البلاغات', path: '/incidents-management', icon: Settings, page: 'incidents-management' },
        { title: 'بلاغ جديد', path: '/new-incident', icon: Plus, page: 'new-incident' },
        { title: 'المطلوبون', path: '/wanted-persons-tree', icon: Users, page: 'wanted-persons-tree' },
        { title: 'التعرف على الوجوه', path: '/face-recognition', icon: Eye, page: 'face-recognition' }
      ]
    },
    {
      id: 'special_police',
      title: 'الشرطة الخاصة',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      visible: userRole === 'admin' || userRole === 'special_police',
      pages: [
        { title: 'المهام', path: '/tasks', icon: CheckSquare, page: 'tasks' },
        { title: 'الدوريات', path: '/patrol', icon: Users, page: 'patrol' },
        { title: 'التغذية', path: '/feed', icon: Rss, page: 'feed' },
        { title: 'المحادثات', path: '/chat', icon: MessageCircle, page: 'chat' }
      ]
    },
    {
      id: 'cybercrime',
      title: 'الجرائم الإلكترونية',
      icon: Computer,
      color: 'from-indigo-500 to-indigo-600',
      visible: userRole === 'admin' || userRole === 'cybercrime',
      pages: [
        { title: 'الجرائم الإلكترونية', path: '/cybercrime', icon: Shield, page: 'cybercrime' },
        { title: 'تقارير الجرائم', path: '/cybercrime-reports', icon: FileText, page: 'cybercrime-reports' },
        { title: 'التقارير والإحصائيات', path: '/reports', icon: BarChart3, page: 'reports' }
      ]
    }
  ];

  const getCurrentDepartment = () => {
    const currentPath = location.pathname;
    for (const dept of departments) {
      if (dept.pages.some(page => page.path === currentPath)) {
        return dept.id;
      }
    }
    return null;
  };

  const currentDept = getCurrentDepartment();

  return (
    <div className={`h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sidebar-foreground font-arabic">نظام إدارة الشرطة</h2>
                <p className="text-xs text-muted-foreground font-arabic">فلسطين - Palestine</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold font-arabic">
                {user?.full_name?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sidebar-foreground font-arabic text-sm">
                {user?.full_name || 'مستخدم'}
              </h3>
              <Badge variant="secondary" className="text-xs">
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
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {/* Dashboard Link */}
          <Button
            variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${isCollapsed ? 'px-2' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <Crown className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="font-arabic">الرئيسية</span>}
          </Button>

          {/* Police News Link */}
          <Button
            variant={location.pathname === '/police-news' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${isCollapsed ? 'px-2' : ''}`}
            onClick={() => navigate('/police-news')}
          >
            <Newspaper className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="font-arabic">أخبار الشرطة</span>}
          </Button>

          {/* Departments */}
          {!isCollapsed && (
            <div className="pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground font-arabic px-2 mb-2">
                الأقسام
              </h3>
              
              {departments
                .filter(dept => dept.visible)
                .map((dept) => {
                  const Icon = dept.icon;
                  const isOpen = openDepartments.includes(dept.id) || currentDept === dept.id;
                  const hasAccessiblePages = dept.pages.some(page => hasAccess(page.page));
                  
                  if (!hasAccessiblePages && userRole !== 'admin') return null;

                  return (
                    <Collapsible key={dept.id} open={isOpen} onOpenChange={() => toggleDepartment(dept.id)}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={currentDept === dept.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-3 mb-1"
                        >
                          <div className={`p-1.5 rounded-md bg-gradient-to-r ${dept.color}`}>
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-arabic text-sm flex-1 text-right">{dept.title}</span>
                          {isOpen ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="space-y-1">
                        {dept.pages
                          .filter(page => userRole === 'admin' || hasAccess(page.page))
                          .map((page) => {
                            const PageIcon = page.icon;
                            return (
                              <Button
                                key={page.path}
                                variant={location.pathname === page.path ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 mr-6 text-sm"
                                onClick={() => navigate(page.path)}
                              >
                                <PageIcon className="h-3.5 w-3.5" />
                                <span className="font-arabic">{page.title}</span>
                              </Button>
                            );
                          })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
            </div>
          )}

          {/* Profile Link */}
          <div className="pt-4 border-t border-sidebar-border mt-4">
            <Button
              variant={location.pathname === '/profile' ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${isCollapsed ? 'px-2' : ''}`}
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="font-arabic">الملف الشخصي</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;