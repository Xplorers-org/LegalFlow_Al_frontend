import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadIcon, EyeIcon, ReceiptTextIcon, CheckCircle2Icon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { PaymentBadge } from '../components/ui/Badge';
import { formatCurrency, calculateLateInterest, getAdjustedDueDate } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function TenantHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState<any>(null);
  const [paidPayments, setPaidPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      setLoading(true);
      try {
        const [tenantsRes, leasesRes] = await Promise.all([
          api.getTenants().catch(() => []),
          api.getLeases().catch(() => []),
        ]);
        const myTenants = tenantsRes.filter((t: any) => t.email.toLowerCase() === user.email.toLowerCase());
        const myTenantIds = myTenants.map((t: any) => t.id);
        const myLeases = leasesRes
          .filter((l: any) => myTenantIds.includes(l.tenant_id))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const currentLease = myLeases[0];
        if (currentLease) {
          setLease(currentLease);
          const paymentsRes = await api.getPayments(currentLease.id).catch(() => []);
          const paid = paymentsRes
            .filter((p: any) => ['paid', 'success', 'completed'].includes(p.status?.toLowerCase()))
            .sort((a: any, b: any) => new Date(b.paid_date || b.updated_at).getTime() - new Date(a.paid_date || a.updated_at).getTime());
          setPaidPayments(paid);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Build display rows with computed totals
  const historyRows = paidPayments.map((p, idx) => {
    const serviceCharge = lease ? parseFloat(lease.service_charge || '0') : 0;
    const interestRate = lease ? parseFloat(lease.interest_rate_pa || '12') : 12;
    const gracePeriod = lease ? parseInt(lease.grace_period_days || '5', 10) : 5;
    const { interest } = calculateLateInterest(parseFloat(p.amount_due), p.due_date, interestRate, gracePeriod, lease?.payment_day);
    const total = parseFloat(p.amount_due) + interest;

    const paidDateDisplay = p.paid_date
      ? new Date(p.paid_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(p.updated_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const receiptNum = p.gateway_reference
      ? `RCT-2026-${p.gateway_reference.slice(-4).toUpperCase()}`
      : `RCT-2026-${String(idx + 1).padStart(4, '0')}`;

    const invoiceNum = p.gateway_reference
      ? `INV-${p.gateway_reference.slice(8, 12)}-${idx + 101}`
      : `INV-2026-${idx + 101}`;

    return { id: p.id, receiptNum, invoiceNum, total, interest, serviceCharge, paidDateDisplay, gateway: p.gateway || 'PayHere', gatewayRef: p.gateway_reference || `ref_${p.id.slice(0, 8)}` };
  });

  const downloadReceipt = (row: typeof historyRows[0]) => {
    const html = `
      <!DOCTYPE html><html><head>
      <title>LegalFlow Receipt — ${row.invoiceNum}</title>
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
      <p style="color:#555;font-size:13px">Invoice ${row.invoiceNum} · ${row.paidDateDisplay}</p>
      <div class="grid">
        <div><div class="label">Receipt No.</div><div class="value">${row.receiptNum}</div></div>
        <div><div class="label">Invoice</div><div class="value">${row.invoiceNum}</div></div>
        <div><div class="label">Property</div><div class="value">${lease?.property_name || 'Premises'}</div></div>
        <div><div class="label">Gateway Reference</div><div class="value">${row.gatewayRef}</div></div>
        <div><div class="label">Paid Date</div><div class="value">${row.paidDateDisplay}</div></div>
        <div><div class="label">Payment Gateway</div><div class="value">${row.gateway}</div></div>
        <div><div class="label">Status</div><div class="value" style="color:#15803d">✓ Paid</div></div>
        ${row.interest > 0 ? `<div><div class="label">Incl. Late Interest</div><div class="value" style="color:#dc2626">${formatCurrency(row.interest)}</div></div>` : ''}
      </div>
      <div class="total"><span>Total Paid</span><span>${formatCurrency(row.total)}</span></div>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Payment History" description="Completed payments and downloadable receipts." />
      <Card>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ReceiptTextIcon className="h-4 w-4 text-primary" /> Completed payments
          </div>
          <span className="text-xs text-muted">{historyRows.length} receipt{historyRows.length !== 1 ? 's' : ''}</span>
        </div>
        <CardContent className="px-0 pb-0">
          {historyRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-dark text-muted">
                <ReceiptTextIcon className="h-7 w-7" />
              </span>
              <p className="mt-4 text-sm font-medium text-foreground">No payment history yet</p>
              <p className="mt-1 text-xs text-muted">Completed payments will appear here once you pay an invoice.</p>
            </div>
          ) : (
            <Table>
              <THead>
                <TH className="pl-5">Receipt Number</TH>
                <TH>Invoice</TH>
                <TH>Amount</TH>
                <TH>Paid Date</TH>
                <TH>Gateway</TH>
                <TH>Status</TH>
                <TH className="pr-5 text-right">Actions</TH>
              </THead>
              <TBody>
                {historyRows.map((row) => (
                  <TR key={row.id}>
                    <TD className="pl-5 font-mono font-medium text-foreground">{row.receiptNum}</TD>
                    <TD className="font-mono text-muted">{row.invoiceNum}</TD>
                    <TD className="font-mono font-medium">
                      {formatCurrency(row.total)}
                      {row.interest > 0 && (
                        <span className="block mt-0.5 text-[10px] text-danger font-medium">
                          Incl. {formatCurrency(row.interest)} interest
                        </span>
                      )}
                    </TD>
                    <TD className="text-muted">{row.paidDateDisplay}</TD>
                    <TD className="text-muted">{row.gateway}</TD>
                    <TD><PaymentBadge status="paid" /></TD>
                    <TD className="pr-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tenant/pay/${row.id}`)}
                        >
                          <EyeIcon className="h-3.5 w-3.5" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Download receipt"
                          onClick={() => downloadReceipt(row)}
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}