import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/hooks/useRoleBasedAccess';
import { supabase } from '@/integrations/supabase/client';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, session } = useAuth();
  const [hasCybercrimeAccess, setHasCybercrimeAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCybercrimeAccess = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Only check cybercrime access if 'cybercrime' is in allowed roles
      if (allowedRoles.includes('cybercrime')) {
        const { data, error } = await supabase
          .from('cybercrime_access')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!error) {
          setHasCybercrimeAccess(!!data);
        }
      }
      
      setLoading(false);
    };

    checkCybercrimeAccess();
  }, [user?.id, allowedRoles]);

  // Show loading while auth state is being determined
  if (session === undefined || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user || !session) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role as UserRole;
  
  // Check if user has required role OR has cybercrime access (if cybercrime role is allowed)
  const hasRoleAccess = allowedRoles.includes(userRole);
  const hasCybercrimeRoleAccess = allowedRoles.includes('cybercrime') && hasCybercrimeAccess === true;
  
  if (!hasRoleAccess && !hasCybercrimeRoleAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
