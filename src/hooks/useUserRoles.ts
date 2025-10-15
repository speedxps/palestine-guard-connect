import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 
  | 'admin'
  | 'traffic_police'
  | 'cid'
  | 'special_police'
  | 'cybercrime'
  | 'judicial_police'
  | 'officer'
  | 'user';

export const useUserRoles = () => {
  const { user, session } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      // Use session.user.id instead of user.id for better reliability
      const userId = session?.user?.id || user?.id;
      
      if (!userId) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching roles for user:', userId);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        console.log('User roles response:', { data, error });

        if (error) {
          console.error('Error fetching user roles:', error);
          throw error;
        }

        const fetchedRoles = data?.map(r => r.role as UserRole) || [];
        console.log('Fetched roles:', fetchedRoles);
        setRoles(fetchedRoles);
      } catch (error) {
        console.error('Exception fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user, session]);

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: UserRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  const isAdmin = hasRole('admin');

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
  };
};
