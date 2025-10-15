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
  const [cybercrimeLoading, setCybercrimeLoading] = useState(false);

  useEffect(() => {
    const checkCybercrimeAccess = async () => {
      if (!user?.id) {
        return;
      }

      // Only check cybercrime access if 'cybercrime' is in allowed roles
      if (allowedRoles.includes('cybercrime')) {
        setCybercrimeLoading(true);
        const { data, error } = await supabase
          .from('cybercrime_access')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!error) {
          setHasCybercrimeAccess(!!data);
        }
        setCybercrimeLoading(false);
      }
    };

    checkCybercrimeAccess();
  }, [user?.id, allowedRoles]);

  // Show loading while auth state or roles are being determined
  if (session === undefined || rolesLoading || (allowedRoles.includes('cybercrime') && cybercrimeLoading)) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user || !session) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has any of the required roles from user_roles table
  const hasRoleAccess = hasAnyRole(allowedRoles);
  const hasCybercrimeRoleAccess = allowedRoles.includes('cybercrime') && hasCybercrimeAccess === true;
  
  console.log('RoleBasedRoute check:', {
    user: user.id,
    userRoles: roles,
    requiredRoles: allowedRoles,
    hasRoleAccess,
    hasCybercrimeRoleAccess
  });
  
  if (!hasRoleAccess && !hasCybercrimeRoleAccess) {
    console.log('Access denied - User roles:', roles, 'Required:', allowedRoles);
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
