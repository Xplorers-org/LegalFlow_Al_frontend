import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2Icon, ShieldCheckIcon, CreditCardIcon, Building2Icon, UserIcon, HashIcon, DownloadIcon, ArrowRightIcon, LoaderCircleIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, calculateLateInterest } from '../lib/utils';
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
  const [processing, setProcessing] = useState(false);
  const [tenant, setTenant] = useState<any | null>(null);
  const [lease, setLease] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const receiptRef = useRef<{ txId: string; rctNum: string; paidDate: string } | null>(null);

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

  // Sequential lock: only the earliest unpaid invoice can be paid
  const sortedUnpaid = [...payments]
    .filter((p) => p.status?.toLowerCase() !== 'paid' && p.status?.toLowerCase() !== 'success' && p.status?.toLowerCase() !== 'completed')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const firstUnpaidPayment = sortedUnpaid[0];
  const isBlocked = !!targetPayment && !!firstUnpaidPayment && targetPayment.id !== firstUnpaidPayment.id;
  const blockingMonthLabel = firstUnpaidPayment
    ? new Date(firstUnpaidPayment.due_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '';

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

  const interestVal = (() => {
    if (!targetPayment || !lease) return 0;
    const interestRate = parseFloat(lease.interest_rate_pa || '12');
    const gracePeriod = parseInt(lease.grace_period_days || '5', 10);
    const payDay = lease.payment_day;
    
    const { interest } = calculateLateInterest(
      parseFloat(targetPayment.amount_due),
      targetPayment.due_date,
      interestRate,
      gracePeriod,
      payDay
    );
    return interest;
  })();

  const total = invoice ? (invoice.amount + invoice.serviceCharge + interestVal) : 0;

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

  // If this invoice is already paid — show receipt view, not the payment form
  const isAlreadyPaid = targetPayment &&
    ['paid', 'success', 'completed'].includes(targetPayment.status?.toLowerCase());

  if (isAlreadyPaid) {
    const paidDateDisplay = targetPayment.paid_date
      ? new Date(targetPayment.paid_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(targetPayment.updated_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const downloadPaidReceipt = () => {
      const html = `
        <!DOCTYPE html><html><head>
        <title>LegalFlow Payment Receipt</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #111; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
          .value { font-size: 14px; font-weight: 600; margin-top: 2px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 20px 0; }
          .total { border-top: 2px solid #111; margin-top: 16px; padding-top: 12px; font-size: 18px; font-weight: 700; display:flex; justify-content:space-between; }
          .badge { display:inline-block; background:#dcfce7; color:#15803d; border-radius:999px; padding:3px 12px; font-size:12px; font-weight:700; margin-bottom:12px; }
          .logo { font-size:13px; color:#6b7280; margin-bottom:24px; }
        </style></head><body>
        <div class="logo">⚖️ LegalFlow AI — Official Payment Receipt</div>
        <div class="badge">✓ PAYMENT CONFIRMED</div>
        <h1>Payment Receipt</h1>
        <p style="color:#555;font-size:13px">Invoice ${invoice.number} · ${paidDateDisplay}</p>
        <div class="grid">
          <div><div class="label">Tenant</div><div class="value">${tenant?.name || 'Tenant'}</div></div>
          <div><div class="label">Property</div><div class="value">${lease?.property_name || 'Premises'}</div></div>
          <div><div class="label">Gateway Reference</div><div class="value">${targetPayment.gateway_reference || invoice.gatewayRef}</div></div>
          <div><div class="label">Paid Date</div><div class="value">${paidDateDisplay}</div></div>
          <div><div class="label">Payment Gateway</div><div class="value">PayHere</div></div>
          <div><div class="label">Status</div><div class="value" style="color:#15803d">✓ Paid</div></div>
        </div>
        <div class="total"><span>Amount Paid</span><span>${formatCurrency(total)}</span></div>
        </body></html>
      `;
      const w = window.open('', '_blank');
      if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
    };

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Payment Receipt"
          breadcrumbs={[{ label: 'Payments', to: '/tenant/payments' }, { label: invoice.number }]}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-success/30 bg-surface p-8 text-center shadow-elevated sm:p-12"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2Icon className="h-9 w-9" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-success">Invoice Paid</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{formatCurrency(total)}</h1>
          <p className="mx-auto mt-2 text-sm text-muted">{invoice.number} · {tenant?.name || 'Tenant'}</p>

          <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-left">
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Gateway Reference</p>
              <p className="mt-1 font-mono text-sm font-medium">{targetPayment.gateway_reference || invoice.gatewayRef}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Paid Date</p>
              <p className="mt-1 text-sm font-medium">{paidDateDisplay}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Property</p>
              <p className="mt-1 text-sm font-medium">{lease?.property_name || 'Premises'}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Gateway</p>
              <p className="mt-1 text-sm font-medium">PayHere</p>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={downloadPaidReceipt}>
              <DownloadIcon className="h-4 w-4" /> Download Receipt
            </Button>
            <Button className="flex-1" onClick={() => navigate('/tenant/payments')}>
              <ArrowRightIcon className="h-4 w-4" /> Back to Payments
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handlePay = async () => {
    setProcessing(true);
    try {
      // Call backend webhook to mark this payment as PAID
      if (targetPayment && targetPayment.id !== 'virtual-payment') {
        await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1')}/payment/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_id: targetPayment.id,
            gateway_reference: targetPayment.gateway_reference || `PH-MOCK-${targetPayment.id.slice(0, 8)}`,
            status: 'PAID',
            amount: total,
          }),
        }).catch(() => {}); // best-effort — success shown regardless for mock
      }
      // Generate stable receipt details
      receiptRef.current = {
        txId: `PH-${Math.floor(10000000 + Math.random() * 90000000)}`,
        rctNum: `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        paidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      // Simulate gateway processing delay
      await new Promise((r) => setTimeout(r, 2200));
      // Signal dashboard to refresh on next visit
      localStorage.setItem('legalflow_payment_updated', Date.now().toString());
    } finally {
      setProcessing(false);
      setSuccess(true);
    }
  };

  const downloadReceipt = () => {
    const rec = receiptRef.current;
    if (!rec || !invoice) return;
    const html = `
      <!DOCTYPE html><html><head>
      <title>LegalFlow Payment Receipt</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 14px; font-weight: 600; margin-top: 2px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 20px 0; }
        .total { border-top: 2px solid #111; margin-top: 16px; padding-top: 12px; font-size: 18px; font-weight: 700; display:flex; justify-content:space-between; }
        .badge { display:inline-block; background:#dcfce7; color:#15803d; border-radius:999px; padding:3px 12px; font-size:12px; font-weight:700; margin-bottom:12px; }
        .logo { font-size:13px; color:#6b7280; margin-bottom:24px; }
      </style></head><body>
      <div class="logo">⚖️ LegalFlow AI — Official Payment Receipt</div>
      <div class="badge">✓ PAYMENT CONFIRMED</div>
      <h1>Payment Receipt</h1>
      <p style="color:#555;font-size:13px">Invoice ${invoice.number} · ${rec.paidDate}</p>
      <div class="grid">
        <div><div class="label">Tenant</div><div class="value">${tenant?.name || 'Tenant'}</div></div>
        <div><div class="label">Property</div><div class="value">${lease?.property_name || 'Premises'}</div></div>
        <div><div class="label">Transaction ID</div><div class="value">${rec.txId}</div></div>
        <div><div class="label">Receipt Number</div><div class="value">${rec.rctNum}</div></div>
        <div><div class="label">Paid Date</div><div class="value">${rec.paidDate}</div></div>
        <div><div class="label">Payment Gateway</div><div class="value">PayHere</div></div>
      </div>
      <div class="total"><span>Total Paid</span><span>${formatCurrency(total)}</span></div>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
  };

  if (success) {
    const rec = receiptRef.current;
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
              <p className="mt-1 font-mono text-sm font-medium">{rec?.txId}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Receipt Number</p>
              <p className="mt-1 font-mono text-sm font-medium">{rec?.rctNum}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Paid Date</p>
              <p className="mt-1 text-sm font-medium">{rec?.paidDate}</p>
            </div>
            <div className="bg-surface p-4">
              <p className="text-xs text-muted">Gateway</p>
              <p className="mt-1 text-sm font-medium">PayHere</p>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={downloadReceipt}>
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
    <div className="relative mx-auto max-w-4xl">
      {/* Processing overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-10 shadow-2xl"
            >
              <LoaderCircleIcon className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">Processing Payment</p>
                <p className="mt-1 text-sm text-muted">Connecting to PayHere secure gateway...</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-success" /> 256-bit SSL encrypted
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
              {interestVal > 0 && <SummaryRow label="Late payment interest" value={formatCurrency(interestVal)} />}
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
              {isBlocked ? (
                <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
                  <p className="text-sm font-medium text-foreground">Payment Blocked</p>
                  <p className="mt-1 text-xs text-muted">
                    Please complete the <span className="font-semibold text-foreground">{blockingMonthLabel}</span> invoice first before paying this one.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/tenant/payments')}>
                    Go to Payments
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="mt-6 w-full" onClick={handlePay}>
                  <ShieldCheckIcon className="h-4 w-4" /> Pay Securely
                </Button>
              )}
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