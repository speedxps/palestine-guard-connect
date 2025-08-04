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
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
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
                // Store user data in localStorage for role-based redirects
                localStorage.setItem('user', JSON.stringify(userData));
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              // Fallback to basic user data
              const userData = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || 'User',
                role: (session.user.user_metadata?.role as UserRole) || 'user',
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }, 0);
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        // The auth state change listener will handle setting the user
      }
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