import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  SearchIcon,
  LinkIcon,
  CopyIcon,
  SendIcon,
  MoreHorizontalIcon,
  BanknoteIcon,
  TimerIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  CreditCardIcon,
  CheckCircle2Icon
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Drawer } from '../components/ui/Drawer';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { PaymentBadge } from '../components/ui/Badge';
import { formatCurrency, calculateLateInterest, getAdjustedDueDate } from '../lib/utils';
import { api } from '../lib/api';

function GatewayBadge({ status }: { status: string }) {
  const online = status === 'paid' || status === 'pending' || status === 'partial';
  return (
    <span
      className={
        online
          ? 'inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success'
          : 'inline-flex items-center gap-1.5 rounded-full bg-slate2/10 px-2.5 py-0.5 text-xs font-medium text-slate2'
      }
    >
      <span className={online ? 'h-1.5 w-1.5 rounded-full bg-success' : 'h-1.5 w-1.5 rounded-full bg-slate2'} />
      {online ? 'Gateway synced' : 'Retry required'}
    </span>
  );
}

function RowMenu({ invoice, onAction }: { invoice: any; onAction: (label: string, invoice: any) => void }) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: 'Copy Payment Link', icon: CopyIcon },
    { label: 'Resend Payment Link', icon: SendIcon },
    { label: 'View Transaction', icon: ExternalLinkIcon }
  ];
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Row actions"
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        <MoreHorizontalIcon className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-pop">
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onMouseDown={() => onAction(label, invoice)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-background"
            >
              <Icon className="h-4 w-4 text-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Payments() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, leasesRes, paymentsRes] = await Promise.all([
        api.getTenants().catch(() => []),
        api.getLeases().catch(() => []),
        api.getPayments().catch(() => []),
      ]);
      setTenants(tenantsRes);
      setLeases(leasesRes);
      setPayments(paymentsRes);
    } catch (err) {
      console.error('Failed to load payments page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Refresh whenever landlord returns to this tab so new tenant payments appear immediately
    const onVisible = () => { if (document.visibilityState === 'visible') loadData(); };
    const onFocus = () => loadData();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handle = (label: string, invoice: any) => {
    if (label === 'View Transaction') {
      setSelected(invoice);
      return;
    }
    const paymentUrl = `${window.location.origin}/tenant/pay/${invoice.id}`;
    if (label.includes('Copy') || label.includes('Generate')) {
      navigator.clipboard.writeText(paymentUrl);
      toast.success(`Payment link copied — send to tenant`);
    } else if (label.includes('Resend')) {
      navigator.clipboard.writeText(paymentUrl);
      toast.success(`Link copied — share with ${invoice.tenant} via WhatsApp or Email`);
    }
  };

  // Build dynamic invoice list
  const displayInvoices = payments.map((p, idx) => {
    const lease = leases.find((l) => l.id === p.lease_id);
    const tenant = lease ? tenants.find((t) => t.id === lease.tenant_id) : null;
    
    const totalAmount = parseFloat(p.amount_due || '0');
    
    const interestRate = lease ? parseFloat(lease.interest_rate_pa || '12') : 12;
    const gracePeriod = lease ? parseInt(lease.grace_period_days || '5', 10) : 5;
    const payDay = lease ? lease.payment_day : 5;
    
    const { interest } = calculateLateInterest(
      totalAmount,
      p.due_date,
      interestRate,
      gracePeriod,
      payDay
    );

    const dueDateAdjusted = getAdjustedDueDate(p.due_date, payDay || 5);

    return {
      id: p.id,
      number: p.gateway_reference ? `INV-${p.gateway_reference.slice(8, 12)}-${idx + 101}` : `INV-2026-${idx + 101}`,
      tenant: tenant ? tenant.name : 'Unknown Tenant',
      amount: totalAmount + interest,
      baseAmount: totalAmount,
      interest: interest,
      dueDate: dueDateAdjusted.toISOString(),
      status: p.status.toLowerCase(),
      gatewayRef: p.gateway_reference || `ref_${p.id.slice(0, 8)}`,
      updatedAt: p.updated_at,
      createdAt: p.created_at,
    };
  });

  const filtered = displayInvoices.filter(
    (invoice) =>
      invoice.tenant.toLowerCase().includes(query.toLowerCase()) ||
      invoice.number.toLowerCase().includes(query.toLowerCase())
  );

  // Compute Stats
  const totalRevenue = displayInvoices
    .filter(inv => inv.status === 'paid' || inv.status === 'success' || inv.status === 'completed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidCount = displayInvoices.filter(inv => inv.status === 'paid' || inv.status === 'success' || inv.status === 'completed').length;

  const pendingPayments = displayInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingCount = displayInvoices.filter(inv => inv.status === 'pending').length;

  const overduePayments = displayInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueCount = displayInvoices.filter(inv => inv.status === 'overdue').length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Retrieving transactions ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Online invoices, gateway status, and reconciled payment activity."
        actions={
          <Button onClick={() => toast.success('Payment link generated & copied')}>
            <LinkIcon className="h-4 w-4" /> Generate Payment Link
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Monthly Revenue"
          value={formatCurrency(totalRevenue)}
          icon={BanknoteIcon}
          tone="primary"
          delta={{ value: `${paidCount} paid`, positive: true }}
          index={0}
        />
        <StatCard
          label="Payments Received"
          value={formatCurrency(totalRevenue)}
          icon={CheckCircle2Icon}
          tone="success"
          hint={`${paidCount} completed this month`}
          index={1}
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(pendingPayments)}
          icon={TimerIcon}
          tone="warning"
          hint={`${pendingCount} invoices awaiting payment`}
          index={2}
        />
        <StatCard
          label="Overdue Payments"
          value={formatCurrency(overduePayments)}
          icon={AlertCircleIcon}
          tone="danger"
          hint={`${overdueCount} cases opened`}
          index={3}
        />
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invoice or tenant…"
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted">{filtered.length} invoices</span>
        </div>
        <CardContent className="px-0 pb-0">
          <Table>
            <THead>
              <TH className="pl-5">Invoice Number</TH>
              <TH>Tenant</TH>
              <TH>Amount</TH>
              <TH>Due Date</TH>
              <TH>Payment Status</TH>
              <TH>Gateway Reference</TH>
              <TH>Gateway Status</TH>
              <TH className="pr-5 text-right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((invoice) => (
                <TR key={invoice.id}>
                  <TD className="pl-5 font-mono font-medium">{invoice.number}</TD>
                  <TD className="text-muted">{invoice.tenant}</TD>
                  <TD className="font-mono font-medium">
                    {formatCurrency(invoice.amount)}
                    {invoice.interest > 0 && (
                      <span className="text-[10px] text-danger font-medium block mt-0.5">
                        Includes {formatCurrency(invoice.interest)} Late Interest
                      </span>
                    )}
                  </TD>
                  <TD className="text-muted">
                    {new Date(invoice.dueDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TD>
                  <TD>
                    <PaymentBadge status={invoice.status} />
                  </TD>
                  <TD>
                    <span className="font-mono text-xs text-muted">{invoice.gatewayRef}</span>
                  </TD>
                  <TD>
                    <GatewayBadge status={invoice.status} />
                  </TD>
                  <TD className="pr-5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => handle('Copy Payment Link', invoice)}>
                        <CopyIcon className="h-3.5 w-3.5" /> Copy Link
                      </Button>
                      <RowMenu invoice={invoice} onAction={handle} />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Transaction Details"
        description={selected ? `${selected.number} · ${selected.tenant}` : ''}
        footer={
          <Button className="w-full" variant="outline" onClick={() => selected && handle('Copy Payment Link', selected)}>
            <CopyIcon className="h-4 w-4" /> Copy payment link
          </Button>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4">
              <div>
                <p className="text-xs text-muted">Payment amount</p>
                <p className="mt-1 font-mono text-2xl font-semibold">{formatCurrency(selected.amount)}</p>
                {selected.interest > 0 && (
                  <p className="text-xs text-danger mt-1 font-medium">Includes {formatCurrency(selected.interest)} late interest</p>
                )}
              </div>
              <PaymentBadge status={selected.status} />
            </div>
            <Detail label="Gateway" value="PayHere" />
            <Detail label="Gateway reference" value={selected.gatewayRef} mono />
            <Detail
              label="Transaction status"
              value={
                selected.status === 'paid'
                  ? 'Captured and settled'
                  : selected.status === 'failed'
                  ? 'Payment attempt failed'
                  : 'Awaiting customer payment'
              }
            />
            <Detail
              label="Created"
              value={new Date(selected.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
            <Detail
              label="Last gateway event"
              value={
                selected.status === 'paid'
                  ? 'Webhook received · Payment completed'
                  : 'Payment request synchronized'
              }
            />
            <div className="rounded-xl border border-success/25 bg-success-soft p-4">
              <div className="flex gap-3">
                <CreditCardIcon className="mt-0.5 h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Gateway reconciliation active</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Status updates from the payment gateway are automatically applied to this invoice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <p className="text-xs text-muted">{label}</p>
      <p className={mono ? 'mt-1 font-mono text-sm font-medium text-foreground' : 'mt-1 text-sm font-medium text-foreground'}>
        {value}
      </p>
    </div>
  );
}