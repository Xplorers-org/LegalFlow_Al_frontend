import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClockIcon, AlertCircleIcon, FileStackIcon, CheckCircle2Icon, CreditCardIcon, EyeIcon, DownloadIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { PaymentBadge } from '../components/ui/Badge';
import { formatCurrency, calculateLateInterest, getAdjustedDueDate } from '../lib/utils';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function TenantPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

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

        const paymentsRes = await api.getPayments(currentLease.id).catch(() => []);
        setPayments(paymentsRes);
      }
    } catch (err) {
      console.error('Error loading tenant payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadData();
    }
  }, [user]);

  // Next due date calculations
  const getNextDueDate = (paymentDayStr: string | number) => {
    let day = parseInt(String(paymentDayStr), 10);
    if (isNaN(day) || day < 1 || day > 31) day = 5;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let dueDate = new Date(currentYear, currentMonth, day);
    if (dueDate < today) {
      dueDate = new Date(currentYear, currentMonth + 1, day);
    }
    return dueDate;
  };

  const nextPaymentDueDate = lease ? getNextDueDate(lease.payment_day) : null;

  // Build the list of displayable invoices — sorted oldest due date first
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const displayInvoices = sortedPayments.length > 0 ? sortedPayments.map((p, idx) => {
    const totalAmount = parseFloat(p.amount_due);
    const serviceChargeVal = lease ? parseFloat(lease.service_charge || '0') : 0;
    const baseAmount = Math.max(0, totalAmount - serviceChargeVal);
    
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
    
    return {
      id: p.id,
      number: p.gateway_reference ? `INV-${p.gateway_reference.slice(8, 12)}-${idx + 101}` : `INV-2026-${idx + 101}`,
      amount: baseAmount,
      serviceCharge: serviceChargeVal,
      interest: interest,
      dueDate: getAdjustedDueDate(p.due_date, lease?.payment_day || 5).toISOString(),
      status: p.status.toLowerCase(),
      gatewayRef: p.gateway_reference || `ref_${p.id.slice(0, 8)}`,
    };
  }) : (lease ? [{
    id: 'virtual-payment',
    number: `INV-2026-001`,
    amount: parseFloat(lease.monthly_rent || '0'),
    serviceCharge: parseFloat(lease.service_charge || '0'),
    interest: 0,
    dueDate: nextPaymentDueDate?.toISOString() || new Date().toISOString(),
    status: 'pending',
    gatewayRef: 'LF-PENDING-CHECKOUT',
  }] : []);

  // Compute stats
  const outstandingBalance = displayInvoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount + inv.serviceCharge + (inv.interest || 0), 0);

  const nextDueInvoice = displayInvoices.find(inv => inv.status === 'pending' || inv.status === 'overdue');
  const pendingCount = displayInvoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length;

  const lastPaidInvoice = displayInvoices
    .filter(inv => inv.status === 'paid' || inv.status === 'success' || inv.status === 'completed')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Loading payment invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Payments" description="Review invoices and make secure online payments." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          icon={AlertCircleIcon}
          tone={outstandingBalance > 0 ? 'danger' : 'success'}
          hint={`${pendingCount} pending invoice(s)`}
          index={0}
        />
        <StatCard
          label="Next Due Date"
          value={nextDueInvoice ? new Date(nextDueInvoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'None'}
          icon={CalendarClockIcon}
          tone="info"
          hint={nextDueInvoice ? `Invoice: ${nextDueInvoice.number}` : 'No payments due'}
          index={1}
        />
        <StatCard
          label="Pending Invoices"
          value={String(pendingCount)}
          icon={FileStackIcon}
          tone="warning"
          hint={nextDueInvoice ? formatCurrency(nextDueInvoice.amount + nextDueInvoice.serviceCharge + (nextDueInvoice.interest || 0)) : formatCurrency(0)}
          index={2}
        />
        <StatCard
          label="Last Successful Payment"
          value={lastPaidInvoice ? formatCurrency(lastPaidInvoice.amount + lastPaidInvoice.serviceCharge + (lastPaidInvoice.interest || 0)) : 'None'}
          icon={CheckCircle2Icon}
          tone="success"
          hint={lastPaidInvoice ? new Date(lastPaidInvoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No transaction history'}
          index={3}
        />
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="text-sm font-medium text-foreground">Your invoices</p>
          <span className="text-xs text-muted">{displayInvoices.length} invoices</span>
        </div>
        <CardContent className="px-0 pb-0">
          {displayInvoices.length > 0 ? (
            <Table>
              <THead>
                <TH className="pl-5">Invoice</TH>
                <TH>Amount</TH>
                <TH>Due Date</TH>
                <TH>Status</TH>
                <TH className="pr-5 text-right">Actions</TH>
              </THead>
              <TBody>
                {(() => {
                  const firstUnpaidIdx = displayInvoices.findIndex(
                    (inv) => inv.status !== 'paid' && inv.status !== 'success' && inv.status !== 'completed'
                  );
                  return displayInvoices.map((invoice, idx) => {
                    const isPaid = invoice.status === 'paid' || invoice.status === 'success' || invoice.status === 'completed';
                    const isPayable = !isPaid && idx === firstUnpaidIdx;
                    const isLocked = !isPaid && idx !== firstUnpaidIdx;
                    return (
                      <TR key={invoice.id}>
                        <TD className="pl-5 font-mono font-medium">{invoice.number}</TD>
                        <TD className="font-mono font-medium">
                          {formatCurrency(invoice.amount + invoice.serviceCharge + (invoice.interest || 0))}
                          {invoice.interest > 0 && (
                            <span className="text-[10px] text-danger font-medium block mt-0.5">
                              + {formatCurrency(invoice.interest)} Late Interest
                            </span>
                          )}
                        </TD>
                        <TD className="text-muted">
                          {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TD>
                        <TD>
                          <PaymentBadge status={invoice.status} />
                        </TD>
                        <TD className="pr-5 text-right">
                          <div className="flex justify-end gap-1">
                            {isPayable && (
                              <Button
                                size="sm"
                                onClick={() => navigate(invoice.id === 'virtual-payment' ? '/tenant/payments' : `/tenant/pay/${invoice.id}`)}
                              >
                                <CreditCardIcon className="h-3.5 w-3.5" /> Pay Now
                              </Button>
                            )}
                            {isLocked && (() => {
                              // Find the invoice just before this one that is still unpaid
                              const prevInvoice = displayInvoices[idx - 1];
                              const prevLabel = prevInvoice
                                ? new Date(prevInvoice.dueDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                                : 'previous';
                              return (
                                <div className="relative group">
                                  <Button
                                    size="sm"
                                    disabled
                                    className="pointer-events-none select-none blur-[0.1px] opacity-40 grayscale cursor-not-allowed"
                                  >
                                    <CreditCardIcon className="h-3.5 w-3.5" /> Pay Now
                                  </Button>
                                  <div className="absolute bottom-full right-0 mb-2 hidden w-56 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted shadow-lg group-hover:block z-10 pointer-events-none">
                                    Complete the <span className="font-semibold text-foreground">{prevLabel}</span> payment first.
                                  </div>
                                </div>
                              );
                            })()}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(invoice.id === 'virtual-payment' ? '/tenant/payments' : `/tenant/pay/${invoice.id}`)}
                            >
                              <EyeIcon className="h-3.5 w-3.5" /> View
                            </Button>
                            {isPaid && (
                              <Button variant="ghost" size="icon" aria-label="Download receipt" onClick={() => toast.success('Receipt downloaded')}>
                                <DownloadIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TD>
                      </TR>
                    );
                  });
                })()}
              </TBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              No invoice records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}