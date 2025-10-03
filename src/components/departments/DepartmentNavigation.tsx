import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home, 
  Newspaper, 
  Settings, 
  Shield, 
  Car, 
  ShieldCheck, 
  Users, 
  Computer,
  Crown
} from 'lucide-react';

export const DepartmentNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role;

  const departments = [
    {
      id: 'traffic_police',
      title: 'شرطة المرور',
      description: 'المخالفات والمركبات',
      icon: Car,
      color: 'from-yellow-500 to-yellow-600',
      pages: ['violations', 'violations-admin', 'vehicle-lookup', 'patrol']
    },
    {
      id: 'cid',
      title: 'المباحث الجنائية',
      description: 'البلاغات والتحقيقات',
      icon: ShieldCheck,
      color: 'from-red-500 to-red-600',
      pages: ['incidents', 'incidents-management', 'new-incident', 'wanted-persons-tree', 'face-recognition']
    },
    {
      id: 'special_police',
      title: 'الشرطة الخاصة',
      description: 'المهام والدوريات',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      pages: ['tasks', 'patrol', 'patrol-old', 'feed', 'chat']
    },
    {
      id: 'cybercrime',
      title: 'الجرائم الإلكترونية',
      description: 'الأمن السيبراني',
      icon: Computer,
      color: 'from-indigo-500 to-indigo-600',
      pages: ['cybercrime', 'cybercrime-reports', 'reports']
    }
  ];

  // Always show these base items
  const baseNavItems = [
    {
      title: 'الرئيسية',
      path: '/dashboard',
      icon: Home,
      isActive: location.pathname === '/dashboard'
    },
    {
      title: 'الأخبار',
      path: '/police-news',
      icon: Newspaper,
      isActive: location.pathname === '/police-news'
    }
  ];

  // Admin gets additional item
  if (userRole === 'admin') {
    baseNavItems.push({
      title: 'لوحة الإدارة',
      path: '/admin-panel',
      icon: Settings,
      isActive: location.pathname === '/admin-panel'
    });
  }

  return (
    <div className="space-y-6">
      {/* Base Navigation */}
      <div className="space-y-2">
        {baseNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={item.isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                item.isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              <span className="font-arabic">{item.title}</span>
            </Button>
          );
        })}
      </div>

      {/* Department Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground font-arabic px-2">الأقسام</h3>
        
        {departments.map((dept) => {
          const Icon = dept.icon;
          // جميع الأقسام متاحة للمستخدمين المسجلين

          const isActiveDepartment = dept.pages.some(page => {
            const pagePath = `/${page.replace(/-/g, '-')}`;
            return location.pathname === pagePath;
          });

          return (
            <Card 
              key={dept.id} 
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                isActiveDepartment ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => {
                // Navigate to first page in department
                const firstPage = dept.pages[0];
                if (firstPage) {
                  navigate(`/${firstPage.replace(/-/g, '-')}`);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${dept.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold font-arabic text-sm">{dept.title}</h4>
                    {userRole === dept.id && (
                      <Badge variant="secondary" className="text-xs">
                        قسمك
                      </Badge>
                    )}
                    {userRole === 'admin' && (
                      <Crown className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-arabic">{dept.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};