








import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2Icon,
  RefreshCwIcon,
  DownloadIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { DocBadge } from '../components/ui/Badge';
import { documents, tenants } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';

export function DocumentPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = documents.find((d) => d.id === id) ?? documents[0];
  const tenant = tenants.find((t) => t.id === doc.tenantId) ?? tenants[0];
  const [status, setStatus] = useState(doc.status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const approve = () => {
    setStatus('approved');
    setConfirmOpen(false);
    toast.success('Document approved & finalized', { description: 'Human-in-the-loop review complete.' });
  };

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      toast('Document regenerated with AI');
    }, 900);
  };

  const outstanding = 414000;

  return (
    <div>
      <PageHeader
        title={doc.type}
        breadcrumbs={[{ label: 'Documents', to: '/documents' }, { label: doc.type }]}
        actions={<DocBadge status={status} />} />
      

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document preview */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-background/50 px-5 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileTextIcon className="h-4 w-4 text-muted" /> Document Preview
              </span>
              <span className="text-xs text-muted">Draft · {tenant.business}</span>
            </div>
            <div className="max-h-[640px] overflow-y-auto bg-background/40 p-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-[640px] rounded-lg border border-border bg-surface p-10 shadow-card"
                style={{ fontFamily: "'Inter', serif" }}>
                
                <div className="mb-8 border-b border-border pb-6 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Private & Confidential</p>
                  <h2 className="mt-3 text-xl font-semibold uppercase tracking-wide text-foreground">{doc.type}</h2>
                </div>

                <div className="mb-6 flex justify-between text-sm text-muted">
                  <div>
                    <p className="font-medium text-foreground">De Silva Holdings (Pvt) Ltd</p>
                    <p>Registered Landlord</p>
                    <p>Colombo 07, Sri Lanka</p>
                  </div>
                  <div className="text-right">
                    <p>Ref: LFD/2026/{doc.id.toUpperCase()}</p>
                    <p>
                      {new Date(doc.generated).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="mb-6 text-sm text-foreground">
                  <p className="font-medium">To:</p>
                  <p>{tenant.name}</p>
                  <p>{tenant.business}</p>
                  <p>{tenant.property}</p>
                </div>

                <p className="mb-4 text-sm font-medium text-foreground">
                  Re: Outstanding Rent Arrears — {tenant.property}
                </p>

                <div className="space-y-4 text-sm leading-relaxed text-foreground">
                  <p>Dear {tenant.name},</p>
                  <p>
                    We write in respect of the commercial premises leased to {tenant.business} under the lease agreement
                    dated {tenant.leaseStart}. Our records indicate that rent instalments remain outstanding, resulting in
                    a total arrears of <span className="font-semibold">{formatCurrency(outstanding)}</span> as at the date
                    of this notice.
                  </p>
                  <p>
                    This sum comprises unpaid monthly rent together with accrued interest at {tenant.interestRate}% per
                    month as provided under Clause 6.2 of the executed lease agreement. Despite prior reminders, payment
                    has not been received within the period stipulated.
                  </p>
                  <p>
                    Pursuant to the Recovery of Possession of Premises Given on Lease Act No. 1 of 2023 and the Rent Act
                    No. 7 of 1972, you are hereby formally required to settle the said arrears in full within{' '}
                    <span className="font-semibold">fourteen (14) days</span> of receipt of this letter.
                  </p>
                  <p>
                    Should payment not be received within the stipulated period, we reserve the right to initiate lawful
                    proceedings for the recovery of arrears and possession of the premises, without further notice.
                  </p>
                  <p>Yours faithfully,</p>
                  <div className="pt-6">
                    <div className="h-px w-40 bg-foreground/40" />
                    <p className="mt-1 font-medium">Marlon De Silva</p>
                    <p className="text-muted">For and on behalf of De Silva Holdings (Pvt) Ltd</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </div>

        {/* Sidebar: metadata + approval */}
        <div className="space-y-6">
          {/* Approval — emphasized */}
          <Card className="border-primary/25 bg-primary-soft/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShieldCheckIcon className="h-4 w-4" /> Human-in-the-Loop Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status === 'approved' ?
              <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                  <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Approved & finalized</p>
                    <p className="text-xs text-muted">This document has been signed off and is ready to send.</p>
                  </div>
                </div> :

              <p className="text-sm text-muted">
                  Review the drafted document carefully. It is only finalized once you explicitly approve it.
                </p>
              }

              <div className="mt-4 space-y-2">
                <Button
                  size="lg"
                  variant="success"
                  className="w-full"
                  disabled={status === 'approved'}
                  onClick={() => setConfirmOpen(true)}>
                  
                  <CheckCircle2Icon className="h-4 w-4" />
                  {status === 'approved' ? 'Approved' : 'Approve Document'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={regenerate} disabled={regenerating}>
                    <RefreshCwIcon className={regenerating ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                    {regenerating ? 'Working…' : 'Regenerate'}
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('Downloading PDF…')}>
                    <DownloadIcon className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Meta icon={FileTextIcon} label="Document Title" value={doc.type} />
              <Meta icon={UserIcon} label="Tenant" value={tenant.name} />
              <Meta icon={BuildingIcon} label="Property" value={tenant.property} />
              <Meta
                icon={CalendarIcon}
                label="Generated Date"
                value={new Date(doc.generated).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })} />
              
            </CardContent>
          </Card>

          {/* Legal basis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-primary" /> Legal Basis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{doc.legalBasis}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <BookOpenIcon className="h-3.5 w-3.5" /> Retrieved via RAG from the legal knowledge base.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Approve this document?"
        description="Approving finalizes the document under your authority. The AI only recommends — you are the approver."
        footer={
        <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={approve}>
              <CheckCircle2Icon className="h-4 w-4" /> Approve & Finalize
            </Button>
          </>
        }>
        
        <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
          <FileTextIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{doc.type}</p>
            <p className="text-xs text-muted">
              {tenant.name} · {tenant.property}
            </p>
          </div>
        </div>
      </Dialog>
    </div>);

}

function Meta({ icon: Icon, label, value }: {icon: React.ElementType;label: string;value: string;}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>);

}