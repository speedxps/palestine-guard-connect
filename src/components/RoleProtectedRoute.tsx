import React from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredPage: string;
  fallbackMessage?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredPage,
  fallbackMessage
}) => {
  const { hasAccess, userRole } = useRoleBasedAccess();

  if (!hasAccess(requiredPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              الوصول مقيد
            </h2>
            <p className="text-muted-foreground mb-4">
              {fallbackMessage || 'هذه الصفحة مخصصة للمستخدمين المخولين فقط'}
            </p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 ml-1" />
              صلاحيتك الحالية: {userRole || 'غير محدد'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};