import React from 'react';
import { DownloadIcon, FileTextIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';

export function TenantLeaseDrawer({ open, onClose }: {open: boolean;onClose: () => void;}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Lease agreement"
      description="Executed commercial lease · 01 January 2023"
      footer={<Button className="w-full" onClick={() => toast.success('Lease agreement downloaded')}><DownloadIcon className="h-4 w-4" /> Download PDF</Button>}>
      
      <div className="rounded-xl border border-border bg-background/50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-soft text-danger"><FileTextIcon className="h-5 w-5" /></span>
          <div><p className="text-sm font-medium text-foreground">Lease_Agreement_Unit4B.pdf</p><p className="text-xs text-muted">2.4 MB · Signed copy</p></div>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-border bg-surface p-5 shadow-card">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">Commercial Lease Agreement</p>
        <h3 className="mt-4 text-center text-base font-semibold text-foreground">Unit 4B, Liberty Plaza</h3>
        <div className="my-6 h-px bg-border" />
        <div className="space-y-4 text-sm leading-relaxed text-foreground">
          <p>This agreement is entered into between <strong>De Silva Holdings (Pvt) Ltd</strong> (the Landlord) and <strong>Perera Textiles (Pvt) Ltd</strong> (the Tenant).</p>
          <p>The tenant shall pay monthly rent of LKR 185,000 together with service charges on or before the 5th day of each calendar month.</p>
          <p>The lease is effective from 01 January 2023 to 31 December 2026, subject to the terms and conditions contained herein.</p>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-success/25 bg-success-soft p-4">
        <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <p className="text-sm text-foreground">This is your executed lease copy, stored securely by LegalFlow AI.</p>
      </div>
    </Drawer>);

}