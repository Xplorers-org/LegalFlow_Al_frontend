import React, { useState, useEffect } from 'react';
import { Building2Icon, CalendarIcon, PhoneIcon, MailIcon, FileTextIcon, ReceiptTextIcon, SparklesIcon, ShieldCheckIcon, AlertCircleIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LeaseBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TenantLeaseDrawer } from '../components/TenantLeaseDrawer';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg p-3 hover:bg-surface-dark transition-colors">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function TenantLease() {
  const { user } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [lease, setLease] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'schedules'>('general');

  useEffect(() => {
    async function loadTenantLease() {
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
        }
      } catch (err) {
        console.error('Error loading tenant lease:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.email) {
      loadTenantLease();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Retrieving lease agreement terms...</p>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircleIcon className="h-10 w-10 text-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Active Lease Found</h3>
        <p className="mt-2 text-sm text-muted max-w-md">There is no active commercial lease agreement currently associated with your account.</p>
      </div>
    );
  }

  const meta = lease.extracted_metadata;

  return (
    <div>
      <PageHeader
        title="My Lease"
        description="Your active commercial lease details and signed agreement schedules."
        actions={<LeaseBadge status={lease.status.toLowerCase()} />}
      />

      {/* Tabs Switcher */}
      <div className="mb-6 flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          General Lease Terms
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'schedules'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Schedules & Utilities
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Lease Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Detail icon={Building2Icon} label="Property Address" value={lease.property_address} />
              <Detail icon={ReceiptTextIcon} label="Business Name" value={tenant?.company || 'Commercial Tenant'} />
              <Detail icon={ReceiptTextIcon} label="Monthly Rent" value={formatCurrency(parseFloat(lease.monthly_rent))} />
              <Detail icon={ReceiptTextIcon} label="Service Charge" value={formatCurrency(parseFloat(lease.service_charge))} />
              <Detail icon={CalendarIcon} label="Payment Due Date" value={`Day ${lease.payment_day} of each month`} />
              <Detail icon={CalendarIcon} label="Lease Period" value={`${lease.lease_start} — ${lease.lease_end}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lease Status</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaseBadge status={lease.status.toLowerCase()} />
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Your lease is currently active. Please maintain timely rental payments on or before the {lease.payment_day}th of each month under your agreement.
              </p>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Lessor (Landlord) Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail icon={Building2Icon} label="Landlord / Company" value={meta?.lessor?.name || "Marlon De Silva"} />
              <Detail icon={PhoneIcon} label="NIC / Business Reg" value={meta?.lessor?.nic_passport || "681122340V"} />
              <Detail icon={MailIcon} label="Lessor Address" value={meta?.lessor?.address || "45 Park Street, Colombo 00200"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lease Agreement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <FileTextIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">Executed Lease Agreement</p>
              <p className="mt-1 text-xs text-muted">PDF Document · AI Grounded Schedules</p>
              <Button className="mt-4 w-full" variant="outline" onClick={() => setDrawer(true)}>
                Open preview
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
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

                  <div className="flex items-start gap-2.5 rounded-lg bg-surface-dark p-3 text-xs text-muted">
                    <ShieldCheckIcon className="h-4 w-4 shrink-0 text-success mt-0.5" />
                    <span>Utility accounts are directly registered with the Ceylon Electricity Board & National Water Supply Board.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <SparklesIcon className="mx-auto h-8 w-8 text-muted" />
              <h3 className="mt-4 text-base font-semibold text-foreground">No Extracted Schedules</h3>
              <p className="mt-1 text-sm text-muted">
                Your lease agreement was created manually. AI-extracted schedules (First, Second, and Third Schedules) are only available if a PDF lease agreement is uploaded.
              </p>
            </div>
          )}
        </div>
      )}

      <TenantLeaseDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}