import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/hooks/useRoleBasedAccess';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, session } = useAuth();

  // Show loading while auth state is being determined
  if (session === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user || !session) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role as UserRole;
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
