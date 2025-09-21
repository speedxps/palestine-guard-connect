import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { 
  Home, Newspaper, Settings, AlertTriangle, Shield, FileText, 
  CheckSquare, Users, Car, Plus, Eye, Rss, MessageCircle, BarChart3, Computer 
} from 'lucide-react';

const iconMap = {
  Home, Newspaper, Settings, AlertTriangle, Shield, FileText,
  CheckSquare, Users, Car, Plus, Eye, Rss, MessageCircle, BarChart3, Computer
};

export const RoleBasedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNavigationItems } = useRoleBasedAccess();

  const navigationItems = getNavigationItems();

  return (
    <div className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-muted'
            }`}
            onClick={() => navigate(item.path)}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="font-arabic">{item.title}</span>
          </Button>
        );
      })}
    </div>
  );
};