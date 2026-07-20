




import React, { useState } from 'react';
import { toast } from 'sonner';
import { UploadCloudIcon, FileTextIcon, CheckCircle2Icon } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input, Field } from './ui/Input';

export function NewTenantDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const [file, setFile] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Tenant & lease created', { description: 'Scheduled payment requests generated automatically.' });
    setFile(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Tenant & Lease"
      description="Create a tenant profile and generate the lease payment schedule."
      className="max-w-2xl"
      footer={
      <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-tenant-form">
            Create tenant
          </Button>
        </>
      }>
      
      <form id="new-tenant-form" onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tenant Name">
            <Input required placeholder="Full name" />
          </Field>
          <Field label="Business Name">
            <Input required placeholder="Registered business" />
          </Field>
          <Field label="Email">
            <Input type="email" required placeholder="tenant@business.lk" />
          </Field>
          <Field label="Phone">
            <Input required placeholder="+94 77 000 0000" />
          </Field>
        </div>

        <Field label="Property Address">
          <Input required placeholder="Unit, building, city" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Monthly Rent (LKR)">
            <Input type="number" required placeholder="185000" />
          </Field>
          <Field label="Service Charge (LKR)">
            <Input type="number" placeholder="22000" />
          </Field>
          <Field label="Due Date (day)">
            <Input type="number" min={1} max={31} required placeholder="5" />
          </Field>
          <Field label="Lease Start">
            <Input type="date" required />
          </Field>
          <Field label="Lease End">
            <Input type="date" required />
          </Field>
          <Field label="Interest Rate (%)">
            <Input type="number" step="0.1" placeholder="2.0" />
          </Field>
        </div>

        <div>
          <p className="mb-1.5 block text-xs font-medium text-foreground">Upload Lease Agreement PDF</p>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary-soft">
            {file ?
            <>
                <CheckCircle2Icon className="h-5 w-5 shrink-0 text-success" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file}</p>
                  <p className="text-xs text-muted">Ready for AI analysis</p>
                </div>
              </> :

            <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-card">
                  <UploadCloudIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload lease PDF</p>
                  <p className="text-xs text-muted">PDF up to 25MB · analyzed by AI agents</p>
                </div>
              </>
            }
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0]?.name ?? 'lease-agreement.pdf')} />
            
            <FileTextIcon className="ml-auto hidden h-4 w-4 text-muted sm:block" />
          </label>
        </div>
      </form>
    </Dialog>);

}