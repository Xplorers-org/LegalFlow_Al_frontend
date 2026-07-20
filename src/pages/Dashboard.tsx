




import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BuildingIcon,
  ClockIcon,
  AlertTriangleIcon,
  FileTextIcon,
  UserPlusIcon,
  FilePlus2Icon,
  LinkIcon,
  SparklesIcon,
  CalendarClockIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ScaleIcon,
  BellIcon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { CaseBadge } from '../components/ui/Badge';
import { cases, upcomingDeadlines, activity } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';

const activityIcons: Record<string, React.ElementType> = {
  payment: CreditCardIcon,
  ai: SparklesIcon,
  overdue: AlertTriangleIcon,
  document: FileTextIcon,
  reminder: BellIcon
};

export function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
  { label: 'New Tenant', icon: UserPlusIcon, action: () => navigate('/tenants?new=1') },
  { label: 'Create Lease', icon: FilePlus2Icon, action: () => navigate('/tenants?new=1') },
  { label: 'Generate Payment Link', icon: LinkIcon, action: () => toast.success('Payment link generated & copied') },
  { label: 'Generate Document', icon: SparklesIcon, action: () => navigate('/cases') }];


  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Real-time health of your commercial lease portfolio."
        actions={
        <>
            <Button variant="outline" onClick={() => toast.success('Payment link generated & copied')}>
              <LinkIcon className="h-4 w-4" /> Payment Link
            </Button>
            <Button onClick={() => navigate('/tenants?new=1')}>
              <UserPlusIcon className="h-4 w-4" /> New Tenant
            </Button>
          </>
        } />
      

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Leases" value="18" icon={BuildingIcon} tone="primary" delta={{ value: '2', positive: true }} hint="3 expiring within 60 days" index={0} />
        <StatCard label="Payments Due" value={formatCurrency(1410000)} icon={ClockIcon} tone="info" hint="Across 4 invoices this week" index={1} />
        <StatCard label="Overdue Cases" value="3" icon={AlertTriangleIcon} tone="danger" delta={{ value: '1', positive: false }} hint="1 requires legal review" index={2} />
        <StatCard label="Documents Generated" value="27" icon={FileTextIcon} tone="success" hint="5 pending your approval" index={3} />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Cases */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
              View all <ArrowRightIcon className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <THead>
                <TH className="pl-5">Tenant</TH>
                <TH>Property</TH>
                <TH>Outstanding</TH>
                <TH>Status</TH>
                <TH>Recommended Action</TH>
                <TH className="pr-5 text-right">Actions</TH>
              </THead>
              <TBody>
                {cases.map((c) =>
                <TR key={c.id}>
                    <TD className="pl-5">
                      <p className="font-medium text-foreground">{c.tenant}</p>
                      <p className="text-xs text-muted">{c.business}</p>
                    </TD>
                    <TD className="text-muted">{c.property}</TD>
                    <TD className="font-mono font-medium">
                      {c.outstanding > 0 ? formatCurrency(c.outstanding) : <span className="text-muted">—</span>}
                    </TD>
                    <TD>
                      <CaseBadge status={c.status} />
                    </TD>
                    <TD className="max-w-[180px] truncate text-muted">{c.recommendedAction}</TD>
                    <TD className="pr-5 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/cases/${c.id}`)}>
                        Open case
                      </Button>
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, action }) =>
            <button
              key={label}
              onClick={action}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background/50 p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary-soft">
              
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-primary shadow-card transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upcoming deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payment Deadlines</CardTitle>
            <CalendarClockIcon className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent className="space-y-1 px-2">
            {upcomingDeadlines.map((d) =>
            <div key={d.tenant} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-background">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <CalendarClockIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{d.tenant}</p>
                  <p className="text-xs text-muted">{d.date} · Due {d.due}</p>
                </div>
                <span className="font-mono text-sm font-medium text-foreground">{formatCurrency(d.amount)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ol className="relative space-y-1">
              {activity.map((a, i) => {
                const Icon = activityIcons[a.icon] ?? ScaleIcon;
                return (
                  <li key={i} className="flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-background">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-slate2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{a.text}</p>
                      <p className="text-xs text-muted">{a.meta}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{a.time}</span>
                  </li>);

              })}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>);

}