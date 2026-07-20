import React, { useState } from 'react';
import { toast } from 'sonner';
import { UploadCloudIcon, FileTextIcon, CheckCircle2Icon, CopyIcon, KeyIcon } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input, Field } from './ui/Input';
import { api } from '../lib/api';

export function NewTenantDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('185000');
  const [serviceCharge, setServiceCharge] = useState('22000');
  const [paymentDay, setPaymentDay] = useState('5');
  const [leaseStart, setLeaseStart] = useState('2026-08-01');
  const [leaseEnd, setLeaseEnd] = useState('2027-07-31');
  const [interestRate, setInterestRate] = useState('12.0');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Tenant Record & User Account in Backend / Supabase
      const tenantRes = await api.createTenant({
        name,
        company,
        email,
        phone,
        address,
      });

      // 2. Create Lease Record in Backend / Supabase
      const leaseRes = await api.createLease({
        tenant_id: tenantRes.id,
        property_name: company || `${name}'s Leased Property`,
        property_address: address,
        monthly_rent: parseFloat(monthlyRent) || 0,
        deposit: parseFloat(monthlyRent) * 2 || 0,
        service_charge: parseFloat(serviceCharge) || 0,
        payment_day: parseInt(paymentDay) || 1,
        lease_start: leaseStart,
        lease_end: leaseEnd,
        interest_rate_pa: parseFloat(interestRate) || 12.0,
      });

      // 3. Create initial payment schedule item
      try {
        await api.createPayment({
          lease_id: leaseRes.id,
          amount_due: parseFloat(monthlyRent) + (parseFloat(serviceCharge) || 0),
          due_date: leaseStart,
          status: 'PENDING',
        });
      } catch (pErr) {
        console.warn("Payment schedule auto-creation note:", pErr);
      }

      if (tenantRes.temp_password) {
        setCreatedCredentials({
          email: tenantRes.email,
          pass: tenantRes.temp_password,
        });
      }

      toast.success('Tenant & Lease Created!', {
        description: `Successfully provisioned login access for ${name}.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      toast.error('Failed to create tenant', {
        description: err.message || 'Check connection to backend server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
    setFile(null);
    setCreatedCredentials(null);
    onClose();
  };

  const copyCreds = () => {
    if (createdCredentials) {
      navigator.clipboard.writeText(
        `LegalFlow AI Tenant Login\nURL: http://localhost:5173/login\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.pass}`
      );
      toast.success('Credentials copied to clipboard!');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={createdCredentials ? 'Tenant Access Provisioned' : 'New Tenant & Lease'}
      description={
        createdCredentials
          ? 'Share these initial login credentials with your tenant so they can access their tenant portal.'
          : 'Create a tenant profile, login account, and generate lease payment schedule.'
      }
      className="max-w-2xl"
      footer={
        createdCredentials ? (
          <Button onClick={handleClose}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="new-tenant-form" disabled={loading}>
              {loading ? 'Creating...' : 'Create tenant'}
            </Button>
          </>
        )
      }
    >
      {createdCredentials ? (
        <div className="space-y-4 rounded-xl border border-primary/20 bg-primary-soft/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <KeyIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Tenant Credentials Ready</h4>
              <p className="text-xs text-muted">Tenant can now log in at your portal</p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background p-3.5 font-mono text-sm">
            <div>
              <span className="text-muted">Login Email: </span>
              <span className="font-semibold text-foreground">{createdCredentials.email}</span>
            </div>
            <div>
              <span className="text-muted">Temporary Password: </span>
              <span className="font-semibold text-primary">{createdCredentials.pass}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={copyCreds}>
            <CopyIcon className="h-4 w-4" /> Copy Login Details
          </Button>
        </div>
      ) : (
        <form id="new-tenant-form" onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tenant Name">
              <Input
                required
                placeholder="Full name (e.g. Nimal Perera)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Business Name">
              <Input
                required
                placeholder="Registered business (e.g. Perera Textiles)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                required
                placeholder="tenant@business.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <Input
                required
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Property Address">
            <Input
              required
              placeholder="Unit, building, city (e.g. 142 Galle Road, Colombo 03)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Monthly Rent (LKR)">
              <Input
                type="number"
                required
                placeholder="185000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
              />
            </Field>
            <Field label="Service Charge (LKR)">
              <Input
                type="number"
                placeholder="22000"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
              />
            </Field>
            <Field label="Due Date (day)">
              <Input
                type="number"
                min={1}
                max={31}
                required
                placeholder="5"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
              />
            </Field>
            <Field label="Lease Start">
              <Input
                type="date"
                required
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
              />
            </Field>
            <Field label="Lease End">
              <Input
                type="date"
                required
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
              />
            </Field>
            <Field label="Statutory Interest (%)">
              <Input
                type="number"
                step="0.1"
                placeholder="12.0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 block text-xs font-medium text-foreground">Upload Lease Agreement PDF</p>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary-soft">
              {file ? (
                <>
                  <CheckCircle2Icon className="h-5 w-5 shrink-0 text-success" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file}</p>
                    <p className="text-xs text-muted">Ready for AI legal agents</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-card">
                    <UploadCloudIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Click to upload lease PDF</p>
                    <p className="text-xs text-muted">PDF up to 25MB · analyzed by LangGraph RAG agents</p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0]?.name ?? 'commercial-lease-agreement.pdf')}
              />
              <FileTextIcon className="ml-auto hidden h-4 w-4 text-muted sm:block" />
            </label>
          </div>
        </form>
      )}
    </Dialog>
  );
}