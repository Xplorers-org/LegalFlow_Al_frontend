import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2Icon, CalendarClockIcon, AlertCircleIcon, CheckCircle2Icon, CreditCardIcon, FileTextIcon, DownloadIcon, ArrowRightIcon, BellRingIcon, RefreshCwIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentBadge, LeaseBadge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  const displayName = user ? user.name : 'Valued Tenant';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, leasesRes] = await Promise.all([
        api.getTenants().catch(() => []),
        api.getLeases().catch(() => []),
      ]);

      const currentTenant = tenantsRes.find((t: any) => t.email === user?.email);
      if (currentTenant) {
        setTenant(currentTenant);
        const currentLease = leasesRes.find((l: any) => l.tenant_id === currentTenant.id);
        setLease(currentLease);

        if (currentLease) {
          const paymentsRes = await api.getPayments(currentLease.id).catch(() => []);
          setPayments(paymentsRes);
        }
      }
    } catch (err) {
      console.error('Error loading tenant dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadDashboardData();
    }
  }, [user]);

  // Derived stats
  const upcomingInvoice = payments.find((p) => p.status === 'PENDING' || p.status === 'OVERDUE');
  
  const outstandingBalance = payments
    .filter((p) => p.status === 'OVERDUE' || p.status === 'FAILED')
    .reduce((sum, p) => sum + parseFloat(p.amount_due), 0);

  const lastPayment = payments
    .filter((p) => p.status === 'PAID')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  const totalDueToday = upcomingInvoice ? parseFloat(upcomingInvoice.amount_due) : 0;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Loading your tenant portal dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Your commercial lease, invoices, and payment activity in one secure place."
        actions={
          upcomingInvoice && (
            <Button onClick={() => navigate(`/tenant/pay/${upcomingInvoice.id}`)}>
              <CreditCardIcon className="h-4 w-4" /> Pay now
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Lease"
          value={lease ? lease.status.toUpperCase() : 'None'}
          icon={Building2Icon}
          tone={lease?.status === 'ACTIVE' ? 'success' : 'muted'}
          hint={lease ? lease.property_name : 'No active property'}
          index={0}
        />
        <StatCard
          label="Next Payment Due"
          value={upcomingInvoice ? new Date(upcomingInvoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'None'}
          icon={CalendarClockIcon}
          tone="info"
          hint={upcomingInvoice ? formatCurrency(totalDueToday) : 'No pending payments'}
          index={1}
        />
        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          icon={AlertCircleIcon}
          tone={outstandingBalance > 0 ? 'danger' : 'success'}
          hint={outstandingBalance > 0 ? "Overdue status monitored by AI" : "All clear"}
          index={2}
        />
        <StatCard
          label="Last Payment"
          value={lastPayment ? formatCurrency(parseFloat(lastPayment.amount_due)) : 'None'}
          icon={CheckCircle2Icon}
          tone="success"
          hint={lastPayment ? new Date(lastPayment.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No transaction history'}
          index={3}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {upcomingInvoice ? (
          <Card className="xl:col-span-2 overflow-hidden border-primary/25">
            <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
              <div>
                <p className="text-xs text-white/60">Upcoming invoice</p>
                <h2 className="mt-0.5 text-base font-semibold">Monthly Rent & Services Payment</h2>
              </div>
              <PaymentBadge status={upcomingInvoice.status.toLowerCase()} />
            </div>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">Property Name</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease?.property_name || 'Leased Premises'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Due date</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {new Date(upcomingInvoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Total due</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-foreground">{formatCurrency(totalDueToday)}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="lg" onClick={() => navigate(`/tenant/pay/${upcomingInvoice.id}`)}>
                  <CreditCardIcon className="h-4 w-4" /> Pay securely
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/tenant/payments')}>
                  View invoices <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="xl:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="py-8 text-center text-sm text-muted">
              🎉 No pending payments due. Your account is fully paid up!
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingInvoice && (
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/tenant/pay/${upcomingInvoice.id}`)}>
                <CreditCardIcon className="h-4 w-4 text-primary" /> Pay Now
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/tenant/lease')}>
              <FileTextIcon className="h-4 w-4 text-primary" /> View Lease & Schedules
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/tenant/history')}>
              <DownloadIcon className="h-4 w-4 text-primary" /> Payment History
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tenant/history')}>
              View all <ArrowRightIcon className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 px-2">
            {payments.filter(p => p.status === 'PAID').slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-dark transition-colors">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                  <CheckCircle2Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">Rent Payment Received</p>
                  <p className="text-xs text-muted">
                    Paid on {new Date(tx.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-mono text-sm font-medium">{formatCurrency(parseFloat(tx.amount_due))}</span>
              </div>
            ))}
            {payments.filter(p => p.status === 'PAID').length === 0 && (
              <div className="py-8 text-center text-xs text-muted">No recent transaction payments recorded.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {outstandingBalance > 0 && (
            <Card className="border-warning/30 bg-warning-soft/20">
              <CardContent className="flex items-start gap-3 pt-5">
                <BellRingIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Payment reminder</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    You have an outstanding balance of **{formatCurrency(outstandingBalance)}**. Please settle it to avoid late interest accumulation.
                  </p>
                  <Button size="sm" className="mt-3" onClick={() => navigate(`/tenant/pay/${payments.find(p => p.status === 'OVERDUE')?.id || ''}`)}>
                    Review payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {lease?.extracted_metadata?.first_schedule && (
            <Card className="border-primary/20 bg-primary-soft/10">
              <CardContent className="pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Leased Premises (First Schedule)</p>
                <h4 className="mt-2 text-sm font-semibold text-foreground">{lease.extracted_metadata.first_schedule.physical_address}</h4>
                <p className="text-xs text-muted mt-1">
                  Assessment No: {lease.extracted_metadata.first_schedule.assessment_number || 'N/A'} · Extent: {lease.extracted_metadata.first_schedule.extent}
                </p>
                <div className="mt-3.5 border-t border-border/70 pt-3 flex justify-between items-center">
                  <span className="text-xs text-muted">Permitted Use:</span>
                  <span className="text-xs font-medium text-foreground">{lease.extracted_metadata.first_schedule.permitted_use}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}