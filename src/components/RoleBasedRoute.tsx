import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/hooks/useRoleBasedAccess';
import { useUserRoles } from '@/hooks/useUserRoles';
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
  const { roles, loading: rolesLoading, hasAnyRole } = useUserRoles();
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
  if (session === undefined || loading || rolesLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user || !session) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has any of the required roles from user_roles table
  const hasRoleAccess = hasAnyRole(allowedRoles);
  const hasCybercrimeRoleAccess = allowedRoles.includes('cybercrime') && hasCybercrimeAccess === true;
  
  if (!hasRoleAccess && !hasCybercrimeRoleAccess) {
    console.log('Access denied - User roles:', roles, 'Required:', allowedRoles);
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
