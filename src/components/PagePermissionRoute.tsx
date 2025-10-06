import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PagePermissionRouteProps {
  children: React.ReactNode;
}

const PagePermissionRoute: React.FC<PagePermissionRouteProps> = ({ children }) => {
  const { user, session } = useAuth();
  const location = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPagePermission();
  }, [user?.id, location.pathname]);

  const checkPagePermission = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // Admin always has access
      if (profile.role === 'admin') {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      // Check page permission
      const { data: permission } = await supabase
        .from('user_page_permissions')
        .select('is_allowed')
        .eq('user_id', profile.id)
        .eq('page_path', location.pathname)
        .maybeSingle();

      // Default to true if no permission record exists
      setHasPermission(permission?.is_allowed ?? true);
    } catch (error) {
      console.error('Error checking page permission:', error);
      setHasPermission(true); // Default to allow on error
    } finally {
      setLoading(false);
    }
  };

  if (session === undefined || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default PagePermissionRoute;