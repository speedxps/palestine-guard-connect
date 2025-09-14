import React from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import AccessDenied from '@/components/AccessDenied';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredPage: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredPage
}) => {
  const { hasAccess } = useRoleBasedAccess();

  if (!hasAccess(requiredPage)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};