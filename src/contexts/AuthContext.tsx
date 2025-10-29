import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';

export type UserRole = 'admin' | 'traffic_police' | 'cid' | 'special_police' | 'cybercrime' | 'judicial_police' | 'officer' | 'user' | 'traffic_manager' | 'cid_manager' | 'special_manager' | 'cybercrime_manager' | 'operations_system' | 'borders' | 'tourism_police' | 'joint_operations';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  full_name?: string; // Add this for profile updates
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>; // Add refresh function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = loading state

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, !!session);
        setSession(session);
        
        if (session?.user) {
          // Set basic user data immediately
          const basicUserData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 'User',
            role: (session.user.user_metadata?.role as UserRole) || 'officer',
          };
          setUser(basicUserData);
          
          // Fetch profile and roles data
          setTimeout(async () => {
            try {
              // Fetch profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              // Fetch user roles
              const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);
                
              // Get the first role or default to profile role
              const primaryRole = userRoles && userRoles.length > 0 
                ? userRoles[0].role as UserRole
                : profile?.role || basicUserData.role;
                
              if (profile) {
                setUser({
                  ...basicUserData,
                  name: profile.full_name || basicUserData.name,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                  role: primaryRole,
                });
                console.log('Profile loaded:', { ...profile, primaryRole });
              } else {
                console.log('No profile found for user');
              }
            } catch (error) {
              console.log('Profile fetch failed, using basic data:', error);
            }
          }, 100);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('AuthContext: Login response:', { data: !!data.user, error: error?.message });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      if (data.user) {
        console.log('AuthContext: Login successful');
        
        // Check device fingerprint
        console.log('AuthContext: Checking device fingerprint...');
        try {
          const deviceData = await generateDeviceFingerprint();
          
          // Get geolocation
          const geolocation = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
            if (!navigator.geolocation) {
              resolve(null);
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
              () => resolve(null),
              { timeout: 3000 }
            );
          });
          
          const { data: deviceCheck, error: deviceError } = await supabase.functions.invoke('check-device-access', {
            body: {
              userId: data.user.id,
              deviceFingerprint: deviceData.fingerprint,
              deviceInfo: deviceData.deviceInfo,
              geolocation,
              userAgent: navigator.userAgent,
            },
          });

          if (deviceError || !deviceCheck?.allowed) {
            console.error('Device not authorized:', deviceCheck);
            await supabase.auth.signOut();
            return false;
          }

          console.log('AuthContext: Device verified successfully');
        } catch (deviceCheckError) {
          console.error('Device check failed:', deviceCheckError);
          await supabase.auth.signOut();
          return false;
        }
        
        // Log the login event to track security
        try {
          const { error: logError } = await supabase.functions.invoke('log-login-event', {
            body: {
              userId: data.user.id,
              success: true,
              route: window.location.pathname
            }
          });
          
          if (logError) {
            console.error('Failed to log login event:', logError);
          } else {
            console.log('Login event logged successfully');
          }
        } catch (logError) {
          console.error('Error logging login event:', logError);
          // Don't block login if logging fails
        }
        
        // Log login activity
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single();
          
          if (profile) {
            await supabase.from('activity_logs').insert({
              user_id: profile.id,
              activity_type: 'login',
              activity_description: `تسجيل دخول المستخدم ${email}`,
              metadata: { email, timestamp: new Date().toISOString() }
            });
          }
        } catch (logError) {
          console.error('Error logging activity:', logError);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    if (!session?.user) return;
    
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // Fetch user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
        
      // Get the first role or default to profile role
      const primaryRole = userRoles && userRoles.length > 0 
        ? userRoles[0].role as UserRole
        : profile?.role;
      
      if (profile) {
        setUser(prev => prev ? {
          ...prev,
          name: profile.full_name || prev.name,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: primaryRole || prev.role,
        } : null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user && !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};