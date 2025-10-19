import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'officer' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, session } = useAuth();
  const [locationChecked, setLocationChecked] = React.useState(false);
  const [isBlocked, setIsBlocked] = React.useState(false);

  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    hasUser: !!user, 
    hasSession: !!session,
    userRole: user?.role 
  });

  // التحقق من الموقع الجغرافي عند كل وصول لصفحة محمية
  React.useEffect(() => {
    const checkLocation = async () => {
      if (session && user) {
        try {
          const { data: locationCheck } = await supabase.functions.invoke('verify-login-location', {
            body: { 
              email: user.email,
              userAgent: navigator.userAgent
            }
          });

          if (locationCheck?.blocked === true || locationCheck?.allowed === false) {
            console.warn('🚫 Access BLOCKED - user outside Palestine');
            setIsBlocked(true);
            // تسجيل الخروج فوراً
            await supabase.auth.signOut();
            window.location.href = '/login';
            return;
          }
        } catch (error) {
          console.error('Location check error:', error);
        }
      }
      setLocationChecked(true);
    };

    checkLocation();
  }, [session, user]);

  // Show loading while checking location
  if (!locationChecked) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحقق من الموقع...</div>;
  }

  // If blocked, redirect to login
  if (isBlocked) {
    return <Navigate to="/login" replace />;
  }

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
      console.log('Redirecting to access denied - insufficient role');
      return <Navigate to="/access-denied" replace />;
    }
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;