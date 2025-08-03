import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'officer' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts
const demoUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@police.ps',
    password: '123',
    name: 'أحمد محمد',
    role: 'admin',
  },
  {
    id: '2',
    email: 'officer1@police.ps',
    password: 'test123',
    name: 'محمد علي',
    role: 'officer',
  },
  {
    id: '3',
    email: 'user1@police.ps',
    password: 'user123',
    name: 'سارة أحمد',
    role: 'user',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('police_app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('police_app_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const demoUser = demoUsers.find(
      u => u.email === email && u.password === password
    );

    if (demoUser) {
      const { password: _, ...userWithoutPassword } = demoUser;
      setUser(userWithoutPassword);
      localStorage.setItem('police_app_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('police_app_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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