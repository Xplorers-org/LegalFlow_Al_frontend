
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DownloadIcon, EyeIcon, FileTextIcon, GavelIcon, ScrollTextIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { DocBadge } from '../components/ui/Badge';
import { documents, type DocumentType } from '../lib/mockData';

const icons: Record<DocumentType, React.ElementType> = { 'Payment Reminder': FileTextIcon, 'Notice to Quit': GavelIcon, 'Letter of Demand': ScrollTextIcon };
export function TenantDocuments() {const navigate = useNavigate();const sent = documents.filter((document) => document.tenantId === 't1');return <div><PageHeader title="Documents" description="Documents shared with you by your landlord. These are read-only." /><Card><div className="flex items-center justify-between border-b border-border p-4"><p className="text-sm font-medium text-foreground">Shared documents</p><span className="text-xs text-muted">{sent.length} documents</span></div><CardContent className="px-0 pb-0"><Table><THead><TH className="pl-5">Document</TH><TH>Generated Date</TH><TH>Status</TH><TH className="pr-5 text-right">Actions</TH></THead><TBody>{sent.map((document) => {const Icon = icons[document.type];return <TR key={document.id}><TD className="pl-5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon className="h-4 w-4" /></span><p className="font-medium text-foreground">{document.type}</p></div></TD><TD className="text-muted">{new Date(document.generated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TD><TD><DocBadge status={document.status} /></TD><TD className="pr-5 text-right"><div className="flex justify-end gap-1"><Button variant="outline" size="sm" onClick={() => navigate(`/tenant/documents/${document.id}`)}><EyeIcon className="h-3.5 w-3.5" /> View</Button><Button variant="ghost" size="icon" aria-label="Download document" onClick={() => toast.success('Document downloaded')}><DownloadIcon className="h-4 w-4" /></Button></div></TD></TR>;})}</TBody></Table></CardContent></Card></div>;}