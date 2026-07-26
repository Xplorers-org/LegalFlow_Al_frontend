import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ShieldCheckIcon,
  BuildingIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  PercentIcon,
  ScrollTextIcon,
  GavelIcon,
  FileTextIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  ArrowRightIcon,
  Building2Icon,
  ReceiptTextIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  RefreshCwIcon
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentBadge, CaseBadge, LeaseBadge } from '../components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { formatCurrency, cn, calculateLateInterest } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function CaseDetails() {
  const { id } = useParams(); // Note: This is the Tenant ID navigating from Tenants.tsx
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [lease, setLease] = useState<any>(null);
  const [caseRecord, setCaseRecord] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedules' | 'payments'>('overview');

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const tenantRes = await api.getTenant(id);
      setTenant(tenantRes);

      const leasesRes = await api.getLeases().catch(() => []);
      const tenantLease = leasesRes.find((l: any) => l.tenant_id === id);
      setLease(tenantLease);

      if (tenantLease) {
        const paymentsRes = await api.getPayments(tenantLease.id).catch(() => []);
        setPayments(paymentsRes);

        const casesRes = await api.getCases().catch(() => []);
        const tenantCase = casesRes.find((c: any) => c.lease_id === tenantLease.id);
        setCaseRecord(tenantCase);
      }
    } catch (err) {
      console.error('Failed to load tenant details:', err);
      toast.error('Failed to retrieve tenant or lease details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRunAIAnalysis = async () => {
    if (!caseRecord?.id) {
      toast.info('No active case default found. This tenant is currently in good standing.');
      return;
    }

    setAnalyzing(true);
    const toastId = toast.loading('Invoking LangGraph Legal Compliance Agent state machine...');
    try {
      await api.analyzeCase(caseRecord.id);
      toast.success('AI Compliance Analysis complete!', { id: toastId });
      fetchDetails(); // Refresh case and document draft
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      toast.error('AI Analysis execution failed', {
        id: toastId,
        description: err.message || 'Check connection to ai-service.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Retrieving landlord portfolio details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircleIcon className="h-10 w-10 text-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Tenant Profile Not Found</h3>
        <p className="mt-2 text-sm text-muted">The tenant record does not exist or has been removed.</p>
      </div>
    );
  }

  // Derived stats
  const totalArrears = payments
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

  const monthsInDefault = payments.filter((p) => p.status === 'OVERDUE' || p.status === 'FAILED' || p.status === 'overdue' || p.status === 'failed').length;

  const meta = lease?.extracted_metadata;

  return (
    <div>
      <PageHeader
        title={tenant.name}
        breadcrumbs={[{ label: 'Tenants', to: '/tenants' }, { label: tenant.name }]}
        actions={
          <div className="flex items-center gap-2">
            {caseRecord ? (
              <CaseBadge status={caseRecord.status ? caseRecord.status.toLowerCase() : 'open'} />
            ) : (
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success flex items-center gap-1.5">
                <CheckCircle2Icon className="h-3.5 w-3.5" /> Good Standing
              </span>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Case & Overview
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'schedules'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Extracted Schedules
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'payments'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Payment History
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* AI Legal Assessment (Only if default case exists) */}
            {caseRecord ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-xl border border-primary/25 bg-primary shadow-elevated"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2.5 text-primary-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      <SparklesIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">AI Legal Assessment</p>
                      <p className="text-xs text-white/60">LangGraph multi-agent · RAG grounded</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">Arrears default</p>
                    <p className="text-lg font-semibold text-primary-foreground">{formatCurrency(totalArrears)}</p>
                  </div>
                </div>

                <div className="bg-surface p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-xs text-muted">Current Status</p>
                      <p className="mt-1 text-sm font-semibold text-foreground capitalize">
                        {caseRecord.status ? caseRecord.status.replace('_', ' ') : 'Open'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-xs text-muted">Months in Default</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{monthsInDefault} months</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-xs text-muted">Statutory Interest Rate</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-danger">
                        {lease ? `${lease.interest_rate_pa}% p.a.` : '12.0% p.a.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">AI Reason Summary</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      {caseRecord.ai_reasoning ||
                        `${tenant.company || tenant.name} is in default of ${monthsInDefault} consecutive monthly rent payments. Action is required to protect lessor interest.`}
                    </p>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary-soft p-4">
                    <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Recommended Escalation</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {caseRecord.recommended_action ? caseRecord.recommended_action.replace('_', ' ').toUpperCase() : 'RUN AI COMPLIANCE ANALYSIS'}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={analyzing}
                      onClick={handleRunAIAnalysis}
                    >
                      <RefreshCwIcon className={cn('h-4 w-4', analyzing && 'animate-spin')} />
                      Analyze Compliance
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/documents`)}
                    >
                      <FileTextIcon className="h-4 w-4 text-primary" />
                      View AI Drafts
                    </Button>
                    <Button
                      onClick={() => navigate(`/documents`)}
                    >
                      <GavelIcon className="h-4 w-4" />
                      Issue Notice
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <Card className="border-success/20 bg-success-soft/20 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2Icon className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Tenant is in Good Standing</h4>
                    <p className="text-sm text-muted mt-1">
                      No payment arrears are currently recorded. The commercial tenant account is active and compliant.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Lease & Tenant info */}
            {lease && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Lease Information</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border/70 pt-0">
                    <InfoRow icon={BuildingIcon} label="Leased Property" value={lease.property_name} />
                    <InfoRow icon={ScrollTextIcon} label="Monthly Rent" value={formatCurrency(parseFloat(lease.monthly_rent))} />
                    <InfoRow icon={ScrollTextIcon} label="Service Charge" value={formatCurrency(parseFloat(lease.service_charge))} />
                    <InfoRow icon={CalendarIcon} label="Lease Term" value={`${lease.lease_start} → ${lease.lease_end}`} />
                    <InfoRow icon={PercentIcon} label="Statutory Interest" value={`${lease.interest_rate_pa}% / year`} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tenant Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border/70 pt-0">
                    <InfoRow icon={UserIcon} label="Tenant name" value={tenant.name} />
                    <InfoRow icon={BuildingIcon} label="Company / Business" value={tenant.company || 'Private Individual'} />
                    <InfoRow icon={MailIcon} label="Email Address" value={tenant.email} />
                    <InfoRow icon={PhoneIcon} label="Phone Number" value={tenant.phone} />
                    <InfoRow icon={CalendarIcon} label="Monthly Invoice Due" value={`Day ${lease.payment_day} of month`} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Outstanding balance */}
            <Card className={cn('border-border', totalArrears > 0 && 'border-danger/25 bg-danger-soft/10')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className={cn('h-4 w-4', totalArrears > 0 ? 'text-danger' : 'text-success')} />
                  Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn('font-mono text-3xl font-bold', totalArrears > 0 ? 'text-danger' : 'text-foreground')}>
                  {formatCurrency(totalArrears)}
                </p>
                <p className="mt-1 text-sm text-muted">{monthsInDefault} months overdue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agreement Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Lease State</span>
                  <LeaseBadge status={lease && lease.status ? lease.status.toLowerCase() : 'active'} />
                </div>
                <div className="text-xs text-muted leading-relaxed">
                  Tenant registered on LegalFlow AI Platform. Automatic invoice reminders and billing dispatches are scheduled according to lease terms.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {meta ? (
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
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.first_schedule?.physical_address || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border p-3">
                    <p className="text-xs text-muted font-semibold uppercase">Assessment Number</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.first_schedule?.assessment_number || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border p-3">
                    <p className="text-xs text-muted font-semibold uppercase">Local Authority</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.first_schedule?.local_authority || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border p-3 sm:col-span-2">
                    <p className="text-xs text-muted font-semibold uppercase">Lot & Plan Reference</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.first_schedule?.lot_plan_reference || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border p-3">
                    <p className="text-xs text-muted font-semibold uppercase">Extent / Size</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.first_schedule?.extent || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted font-semibold uppercase">Permitted Use</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.first_schedule?.permitted_use || "N/A"}</p>
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
                        {meta.second_schedule_breakdown?.base_rent ? formatCurrency(meta.second_schedule_breakdown.base_rent) : formatCurrency(parseFloat(lease.monthly_rent))}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted font-semibold">Security Charge</p>
                      <p className="mt-1 text-base font-mono font-bold text-foreground">
                        {meta.second_schedule_breakdown?.building_security ? formatCurrency(meta.second_schedule_breakdown.building_security) : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted font-semibold">Common Area Cleaning</p>
                      <p className="mt-1 text-base font-mono font-medium text-foreground">
                        {meta.second_schedule_breakdown?.common_area_cleaning ? formatCurrency(meta.second_schedule_breakdown.common_area_cleaning) : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted font-semibold">Common Area Lighting</p>
                      <p className="mt-1 text-base font-mono font-medium text-foreground">
                        {meta.second_schedule_breakdown?.common_area_lighting ? formatCurrency(meta.second_schedule_breakdown.common_area_lighting) : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted font-semibold">Elevator Maintenance</p>
                      <p className="mt-1 text-base font-mono font-medium text-foreground">
                        {meta.second_schedule_breakdown?.elevator_lift_maintenance ? formatCurrency(meta.second_schedule_breakdown.elevator_lift_maintenance) : "N/A"}
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
                    <p className="mt-1 text-sm font-medium text-foreground">{meta.second_schedule_breakdown?.annual_escalation || "N/A"}</p>
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
                      <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">CEB</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      {meta.third_schedule_utilities?.electricity_provider || "Ceylon Electricity Board"}
                    </p>
                    <p className="text-xs text-muted mt-1 font-mono">
                      Acct: {meta.third_schedule_utilities?.electricity_account_no || "N/A"}
                    </p>
                  </div>
 
                  <div className="rounded-lg border border-border p-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">Water Provider</span>
                      <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">NWSDB</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      {meta.third_schedule_utilities?.water_provider || "National Water Supply & Drainage Board"}
                    </p>
                    <p className="text-xs text-muted mt-1 font-mono">
                      Acct: {meta.third_schedule_utilities?.water_account_no || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-background/50">
                    <p className="text-xs text-muted font-semibold uppercase">Liability for Consumption</p>
                    <p className="mt-1.5 text-xs font-medium text-foreground">
                      {meta.third_schedule_utilities?.liability_for_consumption || "Lessee, exclusively, from the Commencement Date"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-background/50">
                    <p className="text-xs text-muted font-semibold uppercase">Recovery of Arrears on Termination</p>
                    <p className="mt-1.5 text-xs font-medium text-foreground">
                      {meta.third_schedule_utilities?.recovery_of_arrears_on_termination || "Firstly from the Security Deposit (Clause 8); balance recoverable by civil action (Clause 6.5)"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <SparklesIcon className="mx-auto h-8 w-8 text-muted" />
              <h3 className="mt-4 text-base font-semibold text-foreground">No Extracted Schedules</h3>
              <p className="mt-1 text-sm text-muted">
                No lease schedules are loaded. Ask the landlord to upload the lease PDF during onboarding to auto-extract schedules.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices & Rent Receipts</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <THead>
                <TH className="pl-5">Invoice Reference</TH>
                <TH>Billing Amount</TH>
                <TH>Due Date</TH>
                <TH className="pr-5">Payment Status</TH>
              </THead>
              <TBody>
                {payments.map((inv) => (
                  <TR key={inv.id}>
                    <TD className="pl-5 font-mono">INV-{inv.id ? String(inv.id).substring(0, 8).toUpperCase() : 'N/A'}</TD>
                    <TD className="font-mono font-medium">{formatCurrency(inv.amount_due ? parseFloat(inv.amount_due) : 0)}</TD>
                    <TD className="text-muted">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </TD>
                    <TD className="pr-5">
                      <PaymentBadge status={inv.status ? inv.status.toLowerCase() : 'pending'} />
                    </TD>
                  </TR>
                ))}
                {payments.length === 0 && (
                  <TR>
                    <TD colSpan={4} className="py-8 text-center text-sm text-muted">No invoices generated yet.</TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}