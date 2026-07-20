




import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon, UserPlusIcon, ArrowRightIcon, SlidersHorizontalIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { LeaseBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { NewTenantDialog } from '../components/NewTenantDialog';
import { tenants } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';

export function Tenants() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get('new') === '1') {
      setOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tenants.filter(
      (t) =>
      t.name.toLowerCase().includes(q) ||
      t.business.toLowerCase().includes(q) ||
      t.property.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Manage tenant profiles, leases, and property assignments."
        actions={
        <Button onClick={() => setOpen(true)}>
            <UserPlusIcon className="h-4 w-4" /> New Tenant
          </Button>
        } />
      

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tenants, businesses…"
              className="pl-9" />
            
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{filtered.length} tenants</span>
            <Button variant="outline" size="sm">
              <SlidersHorizontalIcon className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        </div>

        <CardContent className="px-0 pb-0">
          <Table>
            <THead>
              <TH className="pl-5">Tenant Name</TH>
              <TH>Business Name</TH>
              <TH>Property</TH>
              <TH>Monthly Rent</TH>
              <TH>Lease Status</TH>
              <TH className="pr-5 text-right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((t) =>
              <TR key={t.id} className="cursor-pointer" onClick={() => navigate(`/tenants/${t.id}`)}>
                  <TD className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted">{t.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-muted">{t.business}</TD>
                  <TD className="max-w-[220px] truncate text-muted">{t.property}</TD>
                  <TD className="font-mono font-medium">{formatCurrency(t.monthlyRent)}</TD>
                  <TD>
                    <LeaseBadge status={t.leaseStatus} />
                  </TD>
                  <TD className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/tenants/${t.id}`)}>
                      View case <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <NewTenantDialog open={open} onClose={() => setOpen(false)} />
    </div>);

}