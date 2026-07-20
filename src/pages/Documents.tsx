






import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SearchIcon, EyeIcon, DownloadIcon, RefreshCwIcon, FileTextIcon, ScrollTextIcon, GavelIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { DocBadge } from '../components/ui/Badge';
import { documents, type DocumentType } from '../lib/mockData';

const typeIcon: Record<DocumentType, React.ElementType> = {
  'Payment Reminder': FileTextIcon,
  'Notice to Quit': GavelIcon,
  'Letter of Demand': ScrollTextIcon
};

export function Documents() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = documents.filter(
    (d) => d.tenant.toLowerCase().includes(query.toLowerCase()) || d.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Documents"
        description="AI-generated legal documents. Nothing is finalized without your approval." />
      

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              className="pl-9" />
            
          </div>
          <span className="text-xs text-muted">{filtered.length} documents</span>
        </div>

        <CardContent className="px-0 pb-0">
          <Table>
            <THead>
              <TH className="pl-5">Document Type</TH>
              <TH>Tenant</TH>
              <TH>Generated Date</TH>
              <TH>Status</TH>
              <TH className="pr-5 text-right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((d) => {
                const Icon = typeIcon[d.type];
                return (
                  <TR key={d.id}>
                    <TD className="pl-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{d.type}</p>
                          <p className="max-w-[240px] truncate text-xs text-muted">{d.legalBasis}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-muted">{d.tenant}</TD>
                    <TD className="text-muted">
                      {new Date(d.generated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TD>
                    <TD>
                      <DocBadge status={d.status} />
                    </TD>
                    <TD className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/documents/${d.id}`)}>
                          <EyeIcon className="h-3.5 w-3.5" /> View
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Download" onClick={() => toast.success('Downloading PDF…')}>
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Regenerate" onClick={() => toast('Regenerating with AI…')}>
                          <RefreshCwIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TD>
                  </TR>);

              })}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>);

}