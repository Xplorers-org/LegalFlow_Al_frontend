import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2Icon, CalendarClockIcon, AlertCircleIcon, CheckCircle2Icon, CreditCardIcon, FileTextIcon, DownloadIcon, ArrowRightIcon, BellRingIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentBadge, LeaseBadge } from '../components/ui/Badge';
import { tenantInvoices, tenantTransactions } from '../lib/tenantData';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../lib/auth';

export function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const upcoming = tenantInvoices[0];
  const last = tenantTransactions[0];
  const displayName = user ? user.name : 'Valued Tenant';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Your commercial lease, invoices, and payment activity in one secure place."
        actions={
          <Button onClick={() => navigate(`/tenant/pay/${upcoming.id}`)}>
            <CreditCardIcon className="h-4 w-4" /> Pay now
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Lease" value="Active" icon={Building2Icon} tone="success" hint="Commercial Property" index={0} />
        <StatCard label="Next Payment Due" value="05 Jul" icon={CalendarClockIcon} tone="info" hint={formatCurrency(upcoming.amount + upcoming.serviceCharge)} index={1} />
        <StatCard label="Outstanding Balance" value={formatCurrency(414000)} icon={AlertCircleIcon} tone="danger" hint="Overdue status monitored by AI" index={2} />
        <StatCard label="Last Payment" value={formatCurrency(last.amount)} icon={CheckCircle2Icon} tone="success" hint="05 May 2026" index={3} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 overflow-hidden border-primary/25">
          <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
            <div>
              <p className="text-xs text-white/60">Upcoming invoice</p>
              <h2 className="mt-0.5 text-base font-semibold">Current Month Rent Payment</h2>
            </div>
            <PaymentBadge status={upcoming.status} />
          </div>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted">Property</p>
                <p className="mt-1 text-sm font-medium text-foreground">Leased Premises</p>
              </div>
              <div>
                <p className="text-xs text-muted">Due date</p>
                <p className="mt-1 text-sm font-medium text-foreground">5th of Month</p>
              </div>
              <div>
                <p className="text-xs text-muted">Total due</p>
                <p className="mt-1 font-mono text-lg font-semibold text-foreground">{formatCurrency(upcoming.amount + upcoming.serviceCharge)}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" onClick={() => navigate(`/tenant/pay/${upcoming.id}`)}>
                <CreditCardIcon className="h-4 w-4" /> Pay securely
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/tenant/payments')}>
                View invoice <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/tenant/pay/${upcoming.id}`)}>
              <CreditCardIcon className="h-4 w-4 text-primary" /> Pay Now
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/tenant/lease')}>
              <FileTextIcon className="h-4 w-4 text-primary" /> View Lease
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/tenant/history')}>
              <DownloadIcon className="h-4 w-4 text-primary" /> Download Receipt
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
            {tenantTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
                  <CheckCircle2Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{tx.invoice}</p>
                  <p className="text-xs text-muted">{tx.paidDate} · {tx.gateway}</p>
                </div>
                <span className="font-mono text-sm font-medium">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="border-warning/30 bg-warning-soft/40">
            <CardContent className="flex items-start gap-3 pt-5">
              <BellRingIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-semibold text-foreground">Payment reminder</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">Please ensure monthly rent is settled before the due date to remain compliant.</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/tenant/pay/tenant-i2')}>Review payment</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between pt-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Lease Status</p>
                <p className="mt-1 text-xs text-muted">Commercial Lease Agreement</p>
              </div>
              <LeaseBadge status="active" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}