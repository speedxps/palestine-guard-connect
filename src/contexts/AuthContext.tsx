import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'officer' | 'user' | 'cyber_officer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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
          
          // Try to fetch profile data but don't block on it
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
              if (profile) {
                const userData = {
                  id: profile.id,
                  email: session.user.email || '',
                  name: profile.full_name,
                  role: profile.role as UserRole,
                };
                setUser(userData);
                console.log('Profile loaded:', userData);
              }
            } catch (error) {
              console.log('Profile fetch failed, using basic data');
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
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
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