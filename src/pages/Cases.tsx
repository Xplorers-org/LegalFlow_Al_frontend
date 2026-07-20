





import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { CaseBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { cases } from '../lib/mockData';
import { formatCurrency, cn } from '../lib/utils';

const filters = ['All', 'Action Required', 'Legal Review', 'Overdue', 'Monitoring', 'Healthy'] as const;

export function Cases() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<(typeof filters)[number]>('All');

  const filtered = cases.filter((c) => {
    const matchesQuery =
    c.tenant.toLowerCase().includes(query.toLowerCase()) || c.property.toLowerCase().includes(query.toLowerCase());
    const label = c.status.replace('-', ' ');
    const matchesFilter = active === 'All' || label === active.toLowerCase();
    return matchesQuery && matchesFilter;
  });

  return (
    <div>
      <PageHeader
        title="Cases"
        description="Compliance cases opened from detected payment defaults." />
      

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cases…"
                className="pl-9" />
              
            </div>
            <span className="text-xs text-muted">{filtered.length} cases</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) =>
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                active === f ? 'bg-primary text-primary-foreground' : 'bg-background text-muted hover:text-foreground'
              )}>
              
                {f}
              </button>
            )}
          </div>
        </div>

        <CardContent className="px-0 pb-0">
          <Table>
            <THead>
              <TH className="pl-5">Tenant</TH>
              <TH>Property</TH>
              <TH>Outstanding</TH>
              <TH>Months in Default</TH>
              <TH>Status</TH>
              <TH>AI Recommendation</TH>
              <TH className="pr-5 text-right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((c) =>
              <TR key={c.id}>
                  <TD className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.tenant} />
                      <div>
                        <p className="font-medium text-foreground">{c.tenant}</p>
                        <p className="text-xs text-muted">{c.business}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-muted">{c.property}</TD>
                  <TD className="font-mono font-medium">
                    {c.outstanding > 0 ? formatCurrency(c.outstanding) : <span className="text-muted">—</span>}
                  </TD>
                  <TD className="text-muted">{c.monthsInDefault > 0 ? `${c.monthsInDefault} mo` : '—'}</TD>
                  <TD>
                    <CaseBadge status={c.status} />
                  </TD>
                  <TD>
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                      {c.recommendedAction}
                    </span>
                  </TD>
                  <TD className="pr-5 text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/cases/${c.id}`)}>
                      Open case <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>);

}