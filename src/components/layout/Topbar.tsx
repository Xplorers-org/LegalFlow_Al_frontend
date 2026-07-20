
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeftIcon, SearchIcon, BellIcon, LogOutIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../lib/auth';

export function Topbar({ onToggle }: {onToggle: () => void;}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isTenant = user?.role === 'tenant';
  const leave = () => {signOut();navigate('/');};

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onToggle} aria-label="Toggle sidebar" className="rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground"><PanelLeftIcon className="h-5 w-5" /></button>
      <div className="relative hidden max-w-md flex-1 sm:block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input placeholder={isTenant ? 'Search invoices and documents…' : 'Search tenants, cases, invoices…'} className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button aria-label="Notifications" className="relative rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground"><BellIcon className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-surface bg-danger" /></button>
        {user && <div className="flex items-center gap-2.5 pl-1"><Avatar name={user.name} /><div className="hidden leading-tight lg:block"><p className="text-sm font-medium text-foreground">{user.name}</p><p className="text-xs text-muted">{user.title}</p></div></div>}
        <button onClick={leave} title="Sign out" aria-label="Sign out" className="rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground"><LogOutIcon className="h-4 w-4" /></button>
      </div>
    </header>);

}