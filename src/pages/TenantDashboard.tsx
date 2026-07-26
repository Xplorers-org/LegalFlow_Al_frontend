import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2Icon, CalendarClockIcon, AlertCircleIcon, CheckCircle2Icon, CreditCardIcon, FileTextIcon, DownloadIcon, ArrowRightIcon, BellRingIcon, RefreshCwIcon, ReceiptTextIcon, SparklesIcon, ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentBadge, LeaseBadge } from '../components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { formatCurrency, calculateLateInterest, getAdjustedDueDate } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [utilityBills, setUtilityBills] = useState<any[]>([]);

  const displayName = user ? user.name : 'Valued Tenant';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, leasesRes] = await Promise.all([
        api.getTenants().catch(() => []),
        api.getLeases().catch(() => []),
      ]);

      // Filter all tenant records matching the current user's email
      const myTenants = tenantsRes.filter((t: any) => t.email.toLowerCase() === user?.email?.toLowerCase());
      const myTenantIds = myTenants.map((t: any) => t.id);

      // Find all leases for these matching tenants
      const myLeases = leasesRes.filter((l: any) => myTenantIds.includes(l.tenant_id));

      // Sort leases by created_at descending (latest first) to ensure the newest active lease is matched
      myLeases.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const currentLease = myLeases[0];
      if (currentLease) {
        setLease(currentLease);

        const [paymentsRes, utilityRes] = await Promise.all([
          api.getPayments(currentLease.id).catch(() => []),
          api.getUtilityBills(currentLease.id).catch(() => []),
        ]);
        setPayments(paymentsRes);
        setUtilityBills(utilityRes);
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
  const nextPaymentAmount = lease ? (parseFloat(lease.monthly_rent || '0') + parseFloat(lease.service_charge || '0')) : 0;
  
  const getNextDueDate = (paymentDayStr: string | number) => {
    let day = parseInt(String(paymentDayStr), 10);
    if (isNaN(day) || day < 1 || day > 31) day = 5; // Default fallback to 5th
    
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

  const upcomingInvoice = payments.find((p) => p.status === 'PENDING' || p.status === 'OVERDUE');
  
  const outstandingBalance = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE' || p.status === 'FAILED' || p.status === 'pending' || p.status === 'overdue' || p.status === 'failed')
    .reduce((sum, p) => {
      const interestRate = lease ? parseFloat(lease.interest_rate_pa || '12') : 12;
      const gracePeriod = lease ? parseInt(lease.grace_period_days || '5', 10) : 5;
      const payDay = lease ? lease.payment_day : 5;
      
      const { interest } = calculateLateInterest(
        parseFloat(p.amount_due),
        p.due_date,
        interestRate,
        gracePeriod,
        payDay
      );
      return sum + parseFloat(p.amount_due) + interest;
    }, 0);

  const lastPayment = payments
    .filter((p) => p.status === 'PAID')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  const upcomingInvoiceInterest = (() => {
    if (!upcomingInvoice) return 0;
    const interestRate = lease ? parseFloat(lease.interest_rate_pa || '12') : 12;
    const gracePeriod = lease ? parseInt(lease.grace_period_days || '5', 10) : 5;
    const payDay = lease ? lease.payment_day : 5;
    
    const { interest } = calculateLateInterest(
      parseFloat(upcomingInvoice.amount_due),
      upcomingInvoice.due_date,
      interestRate,
      gracePeriod,
      payDay
    );
    return interest;
  })();

  const totalDueToday = upcomingInvoice ? parseFloat(upcomingInvoice.amount_due) + upcomingInvoiceInterest : nextPaymentAmount;
  const displayDueDate = upcomingInvoice 
    ? getAdjustedDueDate(upcomingInvoice.due_date, lease?.payment_day || 5) 
    : nextPaymentDueDate;

  const activeInvoice = upcomingInvoice || (lease ? {
    id: 'virtual-payment',
    status: 'PENDING',
    amount_due: nextPaymentAmount,
    due_date: nextPaymentDueDate?.toISOString(),
  } : null);

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
          activeInvoice && (
            <Button onClick={() => navigate(activeInvoice.id === 'virtual-payment' ? '/tenant/payments' : `/tenant/pay/${activeInvoice.id}`)}>
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
          tone={lease?.status === 'ACTIVE' ? 'success' : undefined}
          hint={lease ? lease.property_name : 'No active property'}
          index={0}
        />
        <StatCard
          label="Next Payment Due"
          value={displayDueDate ? displayDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'None'}
          icon={CalendarClockIcon}
          tone="info"
          hint={displayDueDate ? formatCurrency(totalDueToday) : 'No pending payments'}
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
        {activeInvoice ? (
          <Card className="xl:col-span-2 overflow-hidden border-primary/25">
            <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
              <div>
                <p className="text-xs text-white/60">Upcoming invoice</p>
                <h2 className="mt-0.5 text-base font-semibold">Monthly Rent & Services Payment</h2>
              </div>
              <PaymentBadge status={activeInvoice.status.toLowerCase()} />
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
                    {displayDueDate ? displayDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Total due</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-foreground">{formatCurrency(totalDueToday)}</p>
                  {upcomingInvoiceInterest > 0 && (
                    <span className="text-[10px] text-danger font-medium block mt-0.5">
                      Includes {formatCurrency(upcomingInvoiceInterest)} late interest
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="lg" onClick={() => navigate(activeInvoice.id === 'virtual-payment' ? '/tenant/payments' : `/tenant/pay/${activeInvoice.id}`)}>
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
            {activeInvoice && (
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(activeInvoice.id === 'virtual-payment' ? '/tenant/payments' : `/tenant/pay/${activeInvoice.id}`)}>
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

      {lease?.extracted_metadata && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <SparklesIcon className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-lg font-bold text-foreground">Lease Agreement Schedules (AI-Extracted)</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* First Schedule - Premises */}
            <Card className="md:col-span-2 lg:col-span-3 border-primary-soft">
              <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Building2Icon className="h-4 w-4" /> First Schedule: Description of Demised Premises
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-5">
                <div className="rounded-lg bg-background border border-border p-3">
                  <p className="text-xs text-muted font-semibold uppercase">Physical Address</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.first_schedule?.physical_address || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3">
                  <p className="text-xs text-muted font-semibold uppercase">Assessment Number</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.first_schedule?.assessment_number || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3">
                  <p className="text-xs text-muted font-semibold uppercase">Local Authority</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.first_schedule?.local_authority || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3 sm:col-span-2">
                  <p className="text-xs text-muted font-semibold uppercase">Lot & Plan Reference</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.first_schedule?.lot_plan_reference || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3">
                  <p className="text-xs text-muted font-semibold uppercase">Extent / Size</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.first_schedule?.extent || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3 sm:col-span-2 lg:col-span-3">
                  <p className="text-xs text-muted font-semibold uppercase">Permitted Use</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.first_schedule?.permitted_use || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Second Schedule - Rent Breakdown */}
            <Card className="lg:col-span-2 border-primary-soft">
              <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <ReceiptTextIcon className="h-4 w-4" /> Second Schedule: Rent & Service Charge Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Base monthly Rent</p>
                    <p className="mt-1 text-base font-mono font-bold text-foreground">
                      {lease.extracted_metadata.second_schedule_breakdown?.base_rent ? formatCurrency(lease.extracted_metadata.second_schedule_breakdown.base_rent) : formatCurrency(parseFloat(lease.monthly_rent))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Security Charge</p>
                    <p className="mt-1 text-base font-mono font-bold text-foreground">
                      {lease.extracted_metadata.second_schedule_breakdown?.building_security ? formatCurrency(lease.extracted_metadata.second_schedule_breakdown.building_security) : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Common Area Cleaning</p>
                    <p className="mt-1 text-base font-mono font-medium text-foreground">
                      {lease.extracted_metadata.second_schedule_breakdown?.common_area_cleaning ? formatCurrency(lease.extracted_metadata.second_schedule_breakdown.common_area_cleaning) : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Common Area Lighting</p>
                    <p className="mt-1 text-base font-mono font-medium text-foreground">
                      {lease.extracted_metadata.second_schedule_breakdown?.common_area_lighting ? formatCurrency(lease.extracted_metadata.second_schedule_breakdown.common_area_lighting) : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Elevator Maintenance</p>
                    <p className="mt-1 text-base font-mono font-medium text-foreground">
                      {lease.extracted_metadata.second_schedule_breakdown?.elevator_lift_maintenance ? formatCurrency(lease.extracted_metadata.second_schedule_breakdown.elevator_lift_maintenance) : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-primary-soft/20 p-3">
                    <p className="text-xs text-primary font-bold">Total Service Charges</p>
                    <p className="mt-1 text-base font-mono font-bold text-primary">
                      {formatCurrency(parseFloat(lease.service_charge))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Due Date</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {lease.payment_day ? `${lease.payment_day}th day of each calendar month` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted font-semibold">Grace Period</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {lease.grace_period_days ? `${lease.grace_period_days} calendar days from the Due Date` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3 col-span-2">
                    <p className="text-xs text-muted font-semibold">Late Payment Interest</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {lease.interest_rate_pa ? `${lease.interest_rate_pa}% per annum, compounding monthly on the Outstanding Balance` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <p className="text-xs text-muted font-semibold uppercase">Annual Rent Escalation Terms</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{lease.extracted_metadata.second_schedule_breakdown?.annual_escalation || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Third Schedule - Utilities */}
            <Card className="border-primary-soft">
              <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" /> Third Schedule: Utility Account Bindings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="rounded-lg border border-border p-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Electricity Provider</span>
                    <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">
                      {lease.extracted_metadata.third_schedule_utilities?.electricity_provider?.includes("LECO") ? "LECO" : "CEB"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {lease.extracted_metadata.third_schedule_utilities?.electricity_provider || "Ceylon Electricity Board"}
                  </p>
                  <p className="text-xs text-muted mt-1 font-mono">
                    Acct: {lease.extracted_metadata.third_schedule_utilities?.electricity_account_no || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Water Provider</span>
                    <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">NWSDB</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {lease.extracted_metadata.third_schedule_utilities?.water_provider || "National Water Supply & Drainage Board"}
                  </p>
                  <p className="text-xs text-muted mt-1 font-mono">
                    Acct: {lease.extracted_metadata.third_schedule_utilities?.water_account_no || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5 bg-background/50">
                  <p className="text-xs text-muted font-semibold uppercase">Liability for Consumption</p>
                  <p className="mt-1.5 text-xs font-medium text-foreground">
                    {lease.extracted_metadata.third_schedule_utilities?.liability_for_consumption || "Lessee, exclusively, from the Commencement Date"}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5 bg-background/50">
                  <p className="text-xs text-muted font-semibold uppercase">Recovery of Arrears on Termination</p>
                  <p className="mt-1.5 text-xs font-medium text-foreground">
                    {lease.extracted_metadata.third_schedule_utilities?.recovery_of_arrears_on_termination || "Firstly from the Security Deposit (Clause 8); balance recoverable by civil action (Clause 6.5)"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Utility Statements Table */}
            <Card className="lg:col-span-2 border-primary-soft">
              <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <ReceiptTextIcon className="h-4 w-4" /> Third Schedule: Utility Statements & Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 px-0 pb-0">
                {utilityBills.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted">
                    No utility bill statements parsed yet. Bills will appear here automatically when received by the landlord.
                  </div>
                ) : (
                  <Table>
                    <THead>
                      <TH className="pl-4">Provider</TH>
                      <TH>Account No</TH>
                      <TH>Amount</TH>
                      <TH>Due Date</TH>
                      <TH className="pr-4 text-right">Status</TH>
                    </THead>
                    <TBody>
                      {utilityBills.map((bill) => (
                        <TR key={bill.id}>
                          <TD className="pl-4 font-semibold">
                            {bill.utility_type === 'ELECTRICITY' ? 'Electricity' : 'Water'}
                          </TD>
                          <TD className="font-mono text-xs text-muted">{bill.account_number}</TD>
                          <TD className="font-mono font-medium text-foreground">{formatCurrency(bill.amount)}</TD>
                          <TD className="text-muted">
                            {new Date(bill.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TD>
                          <TD className="pr-4 text-right">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              bill.status === 'PAID' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                            }`}>
                              <span className={`h-1 w-1 rounded-full ${bill.status === 'PAID' ? 'bg-success' : 'bg-warning'}`} />
                              {bill.status === 'PAID' ? 'Paid' : 'Pending'}
                            </span>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}