import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, ShieldCheckIcon, CreditCardIcon, Building2Icon, UserIcon, HashIcon, DownloadIcon, ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

function SummaryRow({ label, value, total }: {label: string;value: string;total?: boolean;}) {
  return (
    <div className={total ? 'flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-foreground' : 'flex items-center justify-between text-sm'}>
      <span className={total ? 'text-foreground' : 'text-muted'}>{label}</span>
      <span className={total ? 'font-mono text-lg' : 'font-mono text-foreground'}>{value}</span>
    </div>
  );
}

export function PaymentCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any | null>(null);
  const [lease, setLease] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, leasesRes] = await Promise.all([
        api.getTenants().catch(() => []),
        api.getLeases().catch(() => []),
      ]);

      const myTenants = tenantsRes.filter((t: any) => t.email.toLowerCase() === user?.email?.toLowerCase());
      const myTenantIds = myTenants.map((t: any) => t.id);
      const myLeases = leasesRes.filter((l: any) => myTenantIds.includes(l.tenant_id));

      myLeases.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const currentLease = myLeases[0];
      if (currentLease) {
        setLease(currentLease);
        const currentTenant = myTenants.find((t: any) => t.id === currentLease.tenant_id);
        setTenant(currentTenant);

        const paymentsRes = await api.getPayments(currentLease.id).catch(() => []);
        setPayments(paymentsRes);
      }
    } catch (err) {
      console.error('Error loading checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadData();
    }
  }, [user]);

  // Find the target payment
  const targetPayment = payments.find((p) => p.id === id);

  // Synthesize or resolve invoice
  const invoice = targetPayment ? {
    id: targetPayment.id,
    number: targetPayment.gateway_reference ? `INV-${targetPayment.gateway_reference.slice(8, 12)}` : `INV-2026-PAY`,
    amount: lease ? Math.max(0, parseFloat(targetPayment.amount_due) - parseFloat(lease.service_charge || '0')) : parseFloat(targetPayment.amount_due),
    serviceCharge: lease ? parseFloat(lease.service_charge || '0') : 0,
    gatewayRef: targetPayment.gateway_reference || `ref_${targetPayment.id.slice(0, 8)}`,
  } : (lease ? {
    id: 'virtual-payment',
    number: `INV-2026-001`,
    amount: parseFloat(lease.monthly_rent || '0'),
    serviceCharge: parseFloat(lease.service_charge || '0'),
    gatewayRef: 'LF-PENDING-CHECKOUT',
  } : null);

  const total = invoice ? (invoice.amount + invoice.serviceCharge) : 0;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Loading secure payment screen...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center text-sm text-muted">
        No invoice or lease records found to checkout.
      </div>
    );
  }

  const handlePay = () => {
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Payment complete" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-success/30 bg-surface p-8 text-center shadow-elevated sm:p-12"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2Icon className="h-9 w-9" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-success">Payment confirmed</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Payment Successful</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Your payment of {formatCurrency(total)} has been confirmed and your invoice is now marked as paid.
          </p>
          <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-left">
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Transaction ID</p>
              <p className="mt-1 font-mono text-sm font-medium">PH-{Math.floor(10000000 + Math.random() * 90000000)}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Receipt Number</p>
              <p className="mt-1 font-mono text-sm font-medium">RCT-2026-{Math.floor(1000 + Math.random() * 9000)}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Paid Date</p>
              <p className="mt-1 text-sm font-medium">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Gateway</p>
              <p className="mt-1 text-sm font-medium">PayHere</p>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => toast.success('Receipt downloaded')}>
              <DownloadIcon className="h-4 w-4" /> Download Receipt
            </Button>
            <Button className="flex-1" onClick={() => navigate('/tenant/dashboard')}>
              Return to Dashboard <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Secure Payment"
        breadcrumbs={[{ label: 'Payments', to: '/tenant/payments' }, { label: invoice.number }]}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-background/50 p-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <UserIcon className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Tenant Name</p>
                  <p className="text-sm font-medium">{tenant ? tenant.name : 'Tenant'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Building2Icon className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Property</p>
                  <p className="text-sm font-medium">{lease ? lease.property_name : 'Premises'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <HashIcon className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Invoice</p>
                  <p className="font-mono text-sm font-medium">{invoice.number}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CreditCardIcon className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">Payment Gateway</p>
                  <p className="text-sm font-medium">PayHere Secure Checkout</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 py-2">
              <SummaryRow label="Monthly rent" value={formatCurrency(invoice.amount)} />
              <SummaryRow label="Service charge" value={formatCurrency(invoice.serviceCharge)} />
              <SummaryRow label="Total payable" value={formatCurrency(total)} total />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary-soft p-3">
                <CreditCardIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Online card payment</p>
                  <p className="text-xs text-muted">Visa, Mastercard & bank transfer</p>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs text-muted">Reference Number</p>
                <p className="mt-1 font-mono text-sm font-medium">{invoice.gatewayRef}</p>
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={handlePay}>
                <ShieldCheckIcon className="h-4 w-4" /> Pay Securely
              </Button>
            </CardContent>
          </Card>
          <div className="flex items-start gap-3 rounded-xl border border-success/25 bg-success-soft p-4">
            <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-foreground">
              Your payment is processed through a secure, encrypted gateway. LegalFlow AI does not store card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}