import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: Record<string, { password: string; user: User }> = {
  'user@doti.com': {
    password: 'password123',
    user: {
      id: '1',
      email: 'user@doti.com',
      name: 'Jane Smith',
      role: 'user',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-05-15',
      emergencyContact: '+1 (555) 987-6543',
    },
  },
  'admin@doti.com': {
    password: 'admin123',
    user: {
      id: '2',
      email: 'admin@doti.com',
      name: 'Admin User',
      role: 'admin',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('doti_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      localStorage.setItem('doti_user', JSON.stringify(mockUser.user));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    if (mockUsers[email]) {
      return false;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: 'user',
    };

    mockUsers[email] = { password, user: newUser };
    setUser(newUser);
    localStorage.setItem('doti_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('doti_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('doti_user', JSON.stringify(updatedUser));
      
      // Update mock database
      if (mockUsers[user.email]) {
        mockUsers[user.email].user = updatedUser;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
