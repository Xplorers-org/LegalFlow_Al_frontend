
import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth, type UserRole } from '../../lib/auth';

export function AppLayout({ role }: {role: UserRole;}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'tenant' ? '/tenant/dashboard' : '/dashboard'} replace />;
  return <div className="flex h-screen w-full overflow-hidden bg-background"><Sidebar collapsed={collapsed} role={role} /><div className="flex min-w-0 flex-1 flex-col"><Topbar onToggle={() => setCollapsed((c) => !c)} /><main className="flex-1 overflow-y-auto"><div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8"><Outlet /></div></main></div></div>;
}