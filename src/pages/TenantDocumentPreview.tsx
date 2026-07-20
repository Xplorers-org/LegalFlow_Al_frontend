

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DownloadIcon, FileTextIcon, Building2Icon, CalendarIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DocBadge } from '../components/ui/Badge';
import { documents, tenants } from '../lib/mockData';

export function TenantDocumentPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const document = documents.find((item) => item.id === id) ?? documents[0];
  const tenant = tenants.find((item) => item.id === document.tenantId) ?? tenants[0];
  return <div><PageHeader title={document.type} breadcrumbs={[{ label: 'Documents', to: '/tenant/documents' }, { label: document.type }]} actions={<DocBadge status={document.status} />} /><div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><Card className="overflow-hidden lg:col-span-2"><div className="flex items-center justify-between border-b border-border bg-background/50 px-5 py-3"><span className="flex items-center gap-2 text-sm font-medium"><FileTextIcon className="h-4 w-4 text-muted" /> Read-only preview</span><span className="text-xs text-muted">Shared by your landlord</span></div><div className="max-h-[620px] overflow-y-auto bg-background/40 p-6"><article className="mx-auto max-w-[640px] rounded-lg border border-border bg-surface p-8 shadow-card sm:p-10"><p className="text-center text-xs uppercase tracking-[0.18em] text-muted">Private & Confidential</p><h2 className="mt-4 text-center text-xl font-semibold uppercase tracking-wide">{document.type}</h2><div className="my-7 border-t border-border" /><div className="space-y-4 text-sm leading-relaxed text-foreground"><p>Dear {tenant.name},</p><p>This document concerns the commercial premises at {tenant.property} leased to {tenant.business}.</p><p>Please review the notice carefully and retain it for your records. For any questions concerning payment or the terms of your lease, contact your landlord directly.</p><p>Yours faithfully,<br /><strong>De Silva Holdings (Pvt) Ltd</strong></p></div></article></div></Card><div className="space-y-6"><Card><CardHeader><CardTitle>Document Details</CardTitle></CardHeader><CardContent className="space-y-4"><Meta icon={UserIcon} label="Tenant" value={tenant.name} /><Meta icon={Building2Icon} label="Property" value={tenant.property} /><Meta icon={CalendarIcon} label="Generated" value={new Date(document.generated).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} /></CardContent></Card><Card className="border-primary/25 bg-primary-soft/40"><CardContent className="pt-5"><p className="text-sm font-semibold text-foreground">Document access</p><p className="mt-1 text-sm leading-relaxed text-muted">This document is shared for your reference and is read-only.</p><Button className="mt-4 w-full" onClick={() => toast.success('Document downloaded')}><DownloadIcon className="h-4 w-4" /> Download PDF</Button><Button variant="ghost" className="mt-2 w-full" onClick={() => navigate('/tenant/documents')}>Back to Documents</Button></CardContent></Card></div></div></div>;
}
function Meta({ icon: Icon, label, value }: {icon: React.ElementType;label: string;value: string;}) {return <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" /><div><p className="text-xs text-muted">{label}</p><p className="text-sm font-medium text-foreground">{value}</p></div></div>;}