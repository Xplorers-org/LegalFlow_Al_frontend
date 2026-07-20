







import React from 'react';
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
  ArrowRightIcon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentBadge, CaseBadge } from '../components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { cases, tenants, invoices, timeline } from '../lib/mockData';
import { formatCurrency, cn } from '../lib/utils';

function InfoRow({ icon: Icon, label, value }: {icon: React.ElementType;label: string;value: string;}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>);

}

export function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = cases.find((c) => c.id === id) ?? cases[0];
  const tenant = tenants.find((t) => t.id === record.tenantId) ?? tenants[0];
  const tenantInvoices = invoices.filter((i) => i.tenantId === record.tenantId);

  const legalBasis = [
  'Recovery of Possession of Premises Given on Lease Act No. 1 of 2023 — s.3',
  'Rent Act No. 7 of 1972 — s.4 (arrears & lawful notice)',
  `Lease Agreement Clause 6.2 — Payment Terms & Clause 9.1 — Default`];


  return (
    <div>
      <PageHeader
        title={record.tenant}
        breadcrumbs={[{ label: 'Cases', to: '/cases' }, { label: record.tenant }]}
        actions={
        <div className="flex items-center gap-2">
            <CaseBadge status={record.status} />
          </div>
        } />
      

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left / main column */}
        <div className="space-y-6 xl:col-span-2">
          {/* AI Legal Assessment — prominent */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-xl border border-primary/25 bg-primary shadow-elevated">
            
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
                <p className="text-xs text-white/60">Confidence</p>
                <p className="text-lg font-semibold text-primary-foreground">{record.confidence}%</p>
              </div>
            </div>

            <div className="bg-surface p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  <p className="text-xs text-muted">Current Status</p>
                  <p className="mt-1 text-sm font-semibold text-foreground capitalize">
                    {record.status.replace('-', ' ')}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  <p className="text-xs text-muted">Months in Default</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{record.monthsInDefault} months</p>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  <p className="text-xs text-muted">Outstanding Arrears</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-danger">{formatCurrency(record.outstanding)}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Summary of Payment Default</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {tenant.business} has {record.monthsInDefault} consecutive unpaid monthly instalments totalling{' '}
                  <span className="font-medium">{formatCurrency(record.outstanding)}</span>, inclusive of a{' '}
                  {tenant.interestRate}% monthly interest charge under the lease. The default exceeds the grace period
                  defined in Clause 6.2 of the executed lease agreement.
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Legal Explanation</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  Under the Recovery of Possession of Premises Given on Lease Act No. 1 of 2023, a landlord may issue
                  lawful notice where a commercial tenant is in arrears beyond the agreed period. Given the pattern of
                  consecutive defaults and prior reminders, escalation to a formal demand is legally supported. A lawful
                  notice period must be observed before any action for recovery of possession.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Retrieved Legal Basis</p>
                <ul className="mt-2 space-y-1.5">
                  {legalBasis.map((b) =>
                  <li key={b} className="flex items-start gap-2 text-xs text-foreground">
                      <BookOpenIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {b}
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary-soft p-4">
                <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Recommended Action</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{record.recommendedAction}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button variant="outline" size="lg" className="h-auto flex-col items-start gap-1 py-3" onClick={() => navigate('/documents/d5')}>
                  <FileTextIcon className="h-4 w-4 text-primary" />
                  <span>Generate Reminder</span>
                </Button>
                <Button variant="outline" size="lg" className="h-auto flex-col items-start gap-1 py-3" onClick={() => navigate('/documents/d2')}>
                  <GavelIcon className="h-4 w-4 text-danger" />
                  <span>Generate Notice to Quit</span>
                </Button>
                <Button size="lg" className="h-auto flex-col items-start gap-1 py-3" onClick={() => navigate('/documents/d1')}>
                  <ScrollTextIcon className="h-4 w-4" />
                  <span>Generate Letter of Demand</span>
                </Button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-success" />
                AI provides recommendations. Every document requires your explicit approval before it is finalized.
              </p>
            </div>
          </motion.div>

          {/* Lease & Tenant info */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lease Information</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/70 pt-0">
                <InfoRow icon={BuildingIcon} label="Property" value={tenant.property} />
                <InfoRow icon={ScrollTextIcon} label="Monthly Rent" value={formatCurrency(tenant.monthlyRent)} />
                <InfoRow icon={ScrollTextIcon} label="Service Charge" value={formatCurrency(tenant.serviceCharge)} />
                <InfoRow icon={CalendarIcon} label="Lease Term" value={`${tenant.leaseStart} → ${tenant.leaseEnd}`} />
                <InfoRow icon={PercentIcon} label="Interest Rate" value={`${tenant.interestRate}% / month`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/70 pt-0">
                <InfoRow icon={UserIcon} label="Tenant" value={tenant.name} />
                <InfoRow icon={BuildingIcon} label="Business" value={tenant.business} />
                <InfoRow icon={MailIcon} label="Email" value={tenant.email} />
                <InfoRow icon={PhoneIcon} label="Phone" value={tenant.phone} />
                <InfoRow icon={CalendarIcon} label="Payment Due Day" value={`Day ${tenant.dueDay} of month`} />
              </CardContent>
            </Card>
          </div>

          {/* Payment history */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
                All invoices <ArrowRightIcon className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <THead>
                  <TH className="pl-5">Invoice</TH>
                  <TH>Amount</TH>
                  <TH>Due Date</TH>
                  <TH className="pr-5">Status</TH>
                </THead>
                <TBody>
                  {tenantInvoices.map((inv) =>
                  <TR key={inv.id}>
                      <TD className="pl-5 font-mono">{inv.number}</TD>
                      <TD className="font-mono font-medium">{formatCurrency(inv.amount)}</TD>
                      <TD className="text-muted">
                        {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TD>
                      <TD className="pr-5">
                        <PaymentBadge status={inv.status} />
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Outstanding balance */}
          <Card className="border-danger/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-danger" /> Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold text-danger">{formatCurrency(record.outstanding)}</p>
              <p className="mt-1 text-sm text-muted">{record.monthsInDefault} months in arrears</p>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Principal arrears</span>
                  <span className="font-mono font-medium">{formatCurrency(Math.round(record.outstanding * 0.94))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Accrued interest</span>
                  <span className="font-mono font-medium">{formatCurrency(Math.round(record.outstanding * 0.06))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-muted" /> Payment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {timeline.map((m, i) =>
              <div key={m.month} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-muted">{m.month}</span>
                  <div className="relative flex-1">
                    <div className="h-1.5 w-full rounded-full bg-background" />
                    <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      m.status === 'paid' && 'bg-success',
                      m.status === 'partial' && 'bg-warning',
                      m.status === 'overdue' && 'bg-danger',
                      m.status === 'pending' && 'bg-info',
                      m.status === 'failed' && 'bg-slate2'
                    )}
                    style={{ width: m.status === 'partial' ? '48%' : m.status === 'overdue' ? '100%' : '100%' }} />
                  
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <PaymentBadge status={m.status} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}