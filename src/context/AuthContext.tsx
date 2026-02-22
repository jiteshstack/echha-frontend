"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import { User } from '@/types'; 

interface AuthContextType {
  user: User | null;
  token: string | null; // 👈 1. ADDED THIS: Now TypeScript knows token exists
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // 👈 2. ADDED STATE: To hold the token
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. REHYDRATE SESSION ON LOAD
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken); // 👈 Restore token to state
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); 
  }, []);

  // 2. LOGIN (Save everything)
  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData)); 
    
    setToken(newToken); // 👈 Update state so app knows we are logged in
    setUser(userData);
  };

  // 3. LOGOUT (Clear everything)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null); // 👈 Clear state
    setUser(null);
    router.push('/');
    toast.success("Logged out successfully");
  };

  // 4. EXPOSE TOKEN IN VALUE
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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