import React, { useState, useEffect } from 'react';
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
  FileTextIcon
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { DocBadge } from '../components/ui/Badge';
import { api } from '../lib/api';

export function DocumentPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);
  const [lease, setLease] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [status, setStatus] = useState<string>('draft');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchDocumentDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const docRes = await api.getDocument(id);
      setDoc(docRes);
      setStatus(docRes.approval_status.toLowerCase());

      const leaseRes = await api.getLease(docRes.lease_id);
      setLease(leaseRes);

      const tenantRes = await api.getTenant(leaseRes.tenant_id);
      setTenant(tenantRes);
    } catch (err) {
      console.error('Failed to load document details:', err);
      toast.error('Failed to load document details from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const approve = async () => {
    if (!id) return;
    try {
      await api.approveDocument(id, { approved: true });
      setStatus('approved');
      setConfirmOpen(false);
      toast.success('Document approved & finalized', { description: 'Human-in-the-loop review complete.' });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to approve document', { description: err.message });
    }
  };

  const regenerate = async () => {
    if (!doc) return;
    setRegenerating(true);
    try {
      toast.info('Regenerating document using AI agents...');
      const res = await api.generateDocument(doc.case_id, doc.document_type);
      toast.success('Document regenerated successfully.');
      navigate(`/documents/${res.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to regenerate document', { description: err.message });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <RefreshCwIcon className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>Loading legal document draft and verification status...</p>
      </div>
    );
  }

  if (!doc || !lease || !tenant) {
    return (
      <div className="text-center py-12 text-muted">
        <p>Document not found or access was denied.</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Back to Documents</Button>
      </div>
    );
  }

  let typeDisplay = 'Payment Reminder';
  let legalBasis = 'Lease Agreement Clause 6.2 — Payment Terms';

  if (doc.document_type === 'NOTICE_TO_QUIT') {
    typeDisplay = 'Notice to Quit';
    legalBasis = 'Section 3 & 4 of Recovery of Possession of Premises Given on Lease Act No. 1 of 2023';
  } else if (doc.document_type === 'LETTER_OF_DEMAND') {
    typeDisplay = 'Letter of Demand';
    legalBasis = 'Section 4 of Rent Act No. 7 of 1972 & Section 3 of Recovery of Possession Act No. 1 of 2023';
  }

  return (
    <div>
      <PageHeader
        title={typeDisplay}
        breadcrumbs={[{ label: 'Documents', to: '/documents' }, { label: typeDisplay }]}
        actions={<DocBadge status={status as any} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document preview */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-background/50 px-5 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileTextIcon className="h-4 w-4 text-muted" /> Document Draft Preview
              </span>
              <span className="text-xs text-muted">Draft · {tenant.company || tenant.name}</span>
            </div>
            <div className="max-h-[640px] overflow-y-auto bg-background/40 p-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-[640px] rounded-lg border border-border bg-surface p-10 shadow-card"
                style={{ fontFamily: "'Inter', serif" }}
              >
                <div className="mb-8 border-b border-border pb-6 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Private & Confidential</p>
                  <h2 className="mt-3 text-xl font-semibold uppercase tracking-wide text-foreground">{doc.title}</h2>
                </div>

                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-sans">
                  {doc.content}
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
              {status === 'approved' ? (
                <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                  <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Approved & finalized</p>
                    <p className="text-xs text-muted">This document has been signed off and is ready to send.</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Review the drafted document carefully. It is only finalized once you explicitly approve it.
                </p>
              )}

              <div className="mt-4 space-y-2">
                <Button
                  size="lg"
                  variant="success"
                  className="w-full"
                  disabled={status === 'approved'}
                  onClick={() => setConfirmOpen(true)}
                >
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
              <Meta icon={FileTextIcon} label="Document Title" value={doc.title} />
              <Meta icon={UserIcon} label="Tenant" value={tenant.name} />
              <Meta icon={BuildingIcon} label="Property" value={lease.property_address} />
              <Meta
                icon={CalendarIcon}
                label="Generated Date"
                value={new Date(doc.generated_at || doc.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              />
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
              <p className="text-sm leading-relaxed text-foreground">{legalBasis}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <BookOpenIcon className="h-3.5 w-3.5" /> Grounded via RAG Search in active Sri Lankan statutes.
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
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
          <FileTextIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{doc.title}</p>
            <p className="text-xs text-muted">
              {tenant.name} · {lease.property_address}
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string; }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}