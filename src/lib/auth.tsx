import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'landlord' | 'tenant';

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  title: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (email: string) => AuthUser;
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

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) as AuthUser : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (email) => {
        const nextUser = getDemoUser(email);
        setUser(nextUser);
        return nextUser;
      },
      signOut: () => setUser(null)
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