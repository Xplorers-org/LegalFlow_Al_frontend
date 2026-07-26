




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
import { formatCurrency } from '../lib/utils';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const activityIcons: Record<string, React.ElementType> = {
  payment: CreditCardIcon,
  ai: SparklesIcon,
  overdue: AlertTriangleIcon,
  document: FileTextIcon,
  reminder: BellIcon
};

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leases, setLeases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [tenantsRes, leasesRes, paymentsRes, casesRes, docsRes] = await Promise.all([
          api.getTenants().catch(() => []),
          api.getLeases().catch(() => []),
          api.getPayments().catch(() => []),
          api.getCases().catch(() => []),
          api.getDocuments().catch(() => []),
        ]);
        setTenants(tenantsRes);
        setLeases(leasesRes);
        setPayments(paymentsRes);
        setCases(casesRes);
        setDocuments(docsRes);
      } catch (err) {
        console.error('Failed to load landlord dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const quickActions = [
    { label: 'New Tenant', icon: UserPlusIcon, action: () => navigate('/tenants?new=1') },
    { label: 'Create Lease', icon: FilePlus2Icon, action: () => navigate('/tenants?new=1') },
    { label: 'Generate Payment Link', icon: LinkIcon, action: () => toast.success('Payment link generated & copied') },
    { label: 'Generate Document', icon: SparklesIcon, action: () => navigate('/cases') }
  ];

  // Derived stats
  const activeLeasesCount = leases.filter(l => l.status === 'ACTIVE' || l.status === 'active').length;
  
  const totalPaymentsDue = payments
    .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE' || p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + parseFloat(p.amount_due || '0'), 0);

  const activeCasesCount = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED' && c.status !== 'closed' && c.status !== 'resolved').length;

  const recentCasesList = cases.slice(0, 5).map((c) => {
    const lease = leases.find((l) => l.id === c.lease_id);
    const tenant = lease ? tenants.find((t) => t.id === lease.tenant_id) : null;
    return {
      id: c.id,
      tenant: tenant ? tenant.name : 'Unknown Tenant',
      business: tenant ? tenant.company || 'Private Tenant' : 'Unknown Business',
      property: lease ? lease.property_name : 'Unknown Property',
      outstanding: parseFloat(c.outstanding_amount || '0'),
      status: c.status,
      recommendedAction: c.recommended_action || 'No action needed',
    };
  });

  const upcomingDeadlinesList = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE' || p.status === 'pending' || p.status === 'overdue')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3)
    .map((p) => {
      const lease = leases.find((l) => l.id === p.lease_id);
      const tenant = lease ? tenants.find((t) => t.id === lease.tenant_id) : null;
      
      const dueDate = new Date(p.due_date);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dueText = diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `in ${diffDays} days`;

      return {
        tenant: tenant ? tenant.name : 'Unknown Tenant',
        date: dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        due: dueText,
        amount: parseFloat(p.amount_due || '0'),
      };
    });

  const recentActivityList = (() => {
    const list: any[] = [];
    
    payments.forEach((p) => {
      const lease = leases.find((l) => l.id === p.lease_id);
      const tenant = lease ? tenants.find((t) => t.id === lease.tenant_id) : null;
      const tenantName = tenant ? tenant.name : 'Tenant';
      const propName = lease ? lease.property_name : 'Premises';
      
      if (p.status === 'PAID' || p.status === 'paid') {
        list.push({
          icon: 'payment',
          text: `Rent payment received from ${tenantName} for ${propName}`,
          meta: `Paid: ${formatCurrency(parseFloat(p.amount_due))}`,
          time: new Date(p.updated_at).toLocaleDateString(),
          rawTime: new Date(p.updated_at).getTime(),
        });
      } else if (p.status === 'OVERDUE' || p.status === 'overdue') {
        list.push({
          icon: 'overdue',
          text: `Payment overdue for ${tenantName} - ${propName}`,
          meta: `Overdue Amount: ${formatCurrency(parseFloat(p.amount_due))}`,
          time: new Date(p.updated_at).toLocaleDateString(),
          rawTime: new Date(p.updated_at).getTime(),
        });
      }
    });

    cases.forEach((c) => {
      const lease = leases.find((l) => l.id === c.lease_id);
      const tenant = lease ? tenants.find((t) => t.id === lease.tenant_id) : null;
      const tenantName = tenant ? tenant.name : 'Tenant';
      list.push({
        icon: 'ai',
        text: `Compliance case opened for ${tenantName}`,
        meta: c.recommended_action || 'AI Compliance Review',
        time: new Date(c.created_at).toLocaleDateString(),
        rawTime: new Date(c.created_at).getTime(),
      });
    });

    documents.forEach((d) => {
      list.push({
        icon: 'document',
        text: `Document "${d.title}" generated`,
        meta: `Type: ${d.document_type} · Status: ${d.status}`,
        time: new Date(d.created_at).toLocaleDateString(),
        rawTime: new Date(d.created_at).getTime(),
      });
    });

    return list.sort((a, b) => b.rawTime - a.rawTime).slice(0, 4);
  })();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

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
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Leases" value={String(activeLeasesCount)} icon={BuildingIcon} tone="primary" hint="Monitored in real-time" index={0} />
        <StatCard label="Payments Due" value={formatCurrency(totalPaymentsDue)} icon={ClockIcon} tone="info" hint="Outstanding and pending payments" index={1} />
        <StatCard label="Overdue Cases" value={String(activeCasesCount)} icon={AlertTriangleIcon} tone="danger" hint="Requires compliance review" index={2} />
        <StatCard label="Documents Generated" value={String(documents.length)} icon={FileTextIcon} tone="success" hint="AI-drafted templates & letters" index={3} />
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
            {recentCasesList.length > 0 ? (
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
                  {recentCasesList.map((c) => (
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
                  ))}
                </TBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No active compliance cases. All tenants are in full compliance!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background/50 p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary-soft"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-primary shadow-card transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
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
            {upcomingDeadlinesList.length > 0 ? (
              upcomingDeadlinesList.map((d, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-background">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <CalendarClockIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{d.tenant}</p>
                    <p className="text-xs text-muted">{d.date} · Due {d.due}</p>
                  </div>
                  <span className="font-mono text-sm font-medium text-foreground">{formatCurrency(d.amount)}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No upcoming payment deadlines.
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
            {recentActivityList.length > 0 ? (
              <ol className="relative space-y-1">
                {recentActivityList.map((a, i) => {
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
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}