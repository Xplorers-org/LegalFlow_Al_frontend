import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from './api';

export type UserRole = 'landlord' | 'tenant';

export interface AuthUser {
  id?: string;
  role: UserRole;
  name: string;
  email: string;
  title: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (email: string, password?: string) => Promise<AuthUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'legalflow-user';

function getDemoUser(email: string): AuthUser {
  if (email.trim().toLowerCase().includes('nimal')) {
    return {
      role: 'tenant',
      name: 'Nimal Perera',
      email: 'nimal@pereratextiles.lk',
      title: 'Perera Textiles (Pvt) Ltd'
    };
  }

  return {
    role: 'landlord',
    name: 'Marlon De Silva',
    email: 'marlon@delsilvaholdings.lk',
    title: 'Property Portfolio Owner'
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      clearAuthToken();
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: async (email: string, password?: string) => {
        // If password is provided, authenticate against Supabase & FastAPI Backend
        if (password) {
          try {
            const authRes = await api.login({ email, password });
            if (authRes.token && authRes.token.access_token) {
              setAuthToken(authRes.token.access_token);
            }
            const authUser: AuthUser = {
              id: authRes.user.id,
              role: authRes.user.role || 'landlord',
              name: authRes.user.name,
              email: authRes.user.email,
              title: authRes.user.role === 'landlord' ? 'Commercial Landlord Owner' : 'Commercial Tenant',
            };
            setUser(authUser);
            return authUser;
          } catch (err: any) {
            console.error('Supabase/Backend login failed:', err);
            // If user explicitly entered Supabase credentials, throw error so UI alerts user
            if (email.toLowerCase().includes('legalflow') || password === 'LegalFlow2026!') {
              throw err;
            }
          }
        }

        // Demo fallback for mock accounts (marlon@..., nimal@...)
        const fallbackUser = getDemoUser(email);
        setUser(fallbackUser);
        return fallbackUser;
      },
      signOut: () => {
        setUser(null);
        clearAuthToken();
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}