
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  UsersIcon,
  CreditCardIcon,
  ScaleIcon,
  FileTextIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  HistoryIcon,
  Building2Icon } from
'lucide-react';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../lib/auth';

const landlordNav = [
{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
{ to: '/tenants', label: 'Tenants', icon: UsersIcon },
{ to: '/payments', label: 'Payments', icon: CreditCardIcon },
{ to: '/cases', label: 'Cases', icon: ScaleIcon },
{ to: '/documents', label: 'Documents', icon: FileTextIcon }];


const tenantNav = [
{ to: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
{ to: '/tenant/lease', label: 'My Lease', icon: Building2Icon },
{ to: '/tenant/payments', label: 'Payments', icon: CreditCardIcon },
{ to: '/tenant/history', label: 'Payment History', icon: HistoryIcon },
{ to: '/tenant/documents', label: 'Documents', icon: FileTextIcon }];


export function Sidebar({ collapsed, role }: {collapsed: boolean;role: UserRole;}) {
  const nav = role === 'landlord' ? landlordNav : tenantNav;
  const tenantMode = role === 'tenant';

  return (
    <aside className={cn('hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300 md:flex', collapsed ? 'w-[72px]' : 'w-64')}>
      <div className={cn('flex h-16 items-center border-b border-border px-4', collapsed && 'justify-center px-0')}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary"><ScrollTextIcon className="h-5 w-5 text-primary-foreground" /></div>
          {!collapsed && <div className="leading-tight"><p className="text-sm font-semibold text-foreground">LegalFlow AI</p><p className="text-xs text-muted">{tenantMode ? 'Tenant Portal' : 'Compliance Suite'}</p></div>}
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ to, label, icon: Icon }) =>
        <NavLink key={to} to={to} title={collapsed ? label : undefined} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', collapsed && 'justify-center px-0', isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-background hover:text-foreground')}>
            <Icon className="h-[18px] w-[18px] shrink-0" />{!collapsed && label}
          </NavLink>
        )}
      </nav>
      <div className="p-3">
        <div className={cn('flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5', collapsed && 'justify-center px-0')}>
          {tenantMode ? <ShieldCheckIcon className="h-4 w-4 shrink-0 text-success" /> : <ShieldCheckIcon className="h-4 w-4 shrink-0 text-success" />}
          {!collapsed && <p className="text-xs leading-snug text-muted"><span className="font-medium text-foreground">{tenantMode ? 'Secure payment' : 'Human-in-the-loop'}</span> {tenantMode ? 'enabled' : 'active'}</p>}
        </div>
      </div>
    </aside>);

}