import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SearchIcon, EyeIcon, DownloadIcon, RefreshCwIcon, FileTextIcon, ScrollTextIcon, GavelIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { DocBadge } from '../components/ui/Badge';
import { api } from '../lib/api';

type DocumentTypeDisplay = 'Payment Reminder' | 'Notice to Quit' | 'Letter of Demand';

const typeIcon: Record<DocumentTypeDisplay, React.ElementType> = {
  'Payment Reminder': FileTextIcon,
  'Notice to Quit': GavelIcon,
  'Letter of Demand': ScrollTextIcon
};

export function Documents() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [documentsList, setDocumentsList] = useState<any[]>([]);

  const fetchDocumentsData = async () => {
    setLoading(true);
    try {
      const [docsRes, leasesRes, tenantsRes] = await Promise.all([
        api.getDocuments().catch(() => []),
        api.getLeases().catch(() => []),
        api.getTenants().catch(() => []),
      ]);

      const mapped = docsRes.map((d: any) => {
        const lease = leasesRes.find((l: any) => l.id === d.lease_id);
        const tenant = lease ? tenantsRes.find((t: any) => t.id === lease.tenant_id) : null;
        
        let typeDisplay: DocumentTypeDisplay = 'Payment Reminder';
        let legalBasis = 'Lease Agreement Clause 6.2';

        if (d.document_type === 'NOTICE_TO_QUIT') {
          typeDisplay = 'Notice to Quit';
          legalBasis = 'Recovery of Possession of Premises Given on Lease Act No. 1 of 2023, s.3';
        } else if (d.document_type === 'LETTER_OF_DEMAND') {
          typeDisplay = 'Letter of Demand';
          legalBasis = 'Rent Act No. 7 of 1972, s.4; Recovery of Possession Act No. 1 of 2023';
        }

        return {
          id: d.id,
          type: typeDisplay,
          tenant: tenant ? tenant.name : 'Unknown Tenant',
          property: lease ? lease.property_address : 'Commercial Premises',
          generated: d.generated_at || d.created_at,
          status: d.approval_status.toLowerCase(),
          legalBasis: legalBasis,
        };
      });

      setDocumentsList(mapped);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast.error('Failed to load generated documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const filtered = documentsList.filter(
    (d) => d.tenant.toLowerCase().includes(query.toLowerCase()) || d.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Documents"
        description="AI-generated legal documents. Nothing is finalized without your approval."
        actions={
          <Button variant="outline" onClick={fetchDocumentsData}>
            <RefreshCwIcon className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted">{filtered.length} documents</span>
        </div>

        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <RefreshCwIcon className="h-8 w-8 animate-spin mb-3 text-primary" />
              <p className="text-sm">Loading documents list...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted">
              No legal documents found.
            </div>
          ) : (
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
                  const Icon = typeIcon[d.type as DocumentTypeDisplay] || FileTextIcon;
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
                      <TD className="text-muted text-xs">
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
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}