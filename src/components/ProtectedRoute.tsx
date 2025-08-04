import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'officer' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, session } = useAuth();

  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    hasUser: !!user, 
    hasSession: !!session,
    userRole: user?.role 
  });

  // Show loading while auth state is being determined
  if (session === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user || !session) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roleHierarchy = { admin: 3, officer: 2, user: 1 };
    const userLevel = roleHierarchy[user?.role || 'user'];
    const requiredLevel = roleHierarchy[requiredRole];
    
    if (userLevel < requiredLevel) {
      console.log('Redirecting to dashboard - insufficient role');
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;