import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon, UserPlusIcon, ArrowRightIcon, SlidersHorizontalIcon, BuildingIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { LeaseBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { NewTenantDialog } from '../components/NewTenantDialog';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';

export interface TenantRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  business?: string;
  property?: string;
  monthlyRent?: number;
  leaseStatus?: string;
}

export function Tenants() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const [tenantsList, setTenantsList] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Tenants & Leases from Supabase via FastAPI Backend
  const fetchTenantsData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, leasesRes] = await Promise.all([
        api.getTenants().catch(() => []),
        api.getLeases().catch(() => []),
      ]);

      // Map backend tenants and leases together
      const mapped: TenantRecord[] = tenantsRes.map((t: any) => {
        const lease = leasesRes.find((l: any) => l.tenant_id === t.id);
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          company: t.company,
          business: t.company || 'Commercial Tenant',
          property: lease ? lease.property_address : (t.address || 'Commercial Premises'),
          monthlyRent: lease ? parseFloat(lease.monthly_rent) : 0,
          leaseStatus: lease ? lease.status : 'ACTIVE',
        };
      });

      setTenantsList(mapped);
    } catch (err) {
      console.error('Failed to load tenants from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsData();
  }, []);

  useEffect(() => {
    if (params.get('new') === '1') {
      setOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tenantsList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.business && t.business.toLowerCase().includes(q)) ||
        (t.property && t.property.toLowerCase().includes(q))
    );
  }, [tenantsList, query]);

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Manage tenant profiles, commercial leases, and property assignments in Supabase."
        actions={
          <Button onClick={() => setOpen(true)}>
            <UserPlusIcon className="h-4 w-4" /> New Tenant
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
              placeholder="Search tenants, businesses…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{filtered.length} tenants</span>
            <Button variant="outline" size="sm">
              <SlidersHorizontalIcon className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        </div>

        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted">Loading tenants from database...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <BuildingIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">No tenants created yet</h3>
              <p className="mt-1 text-sm text-muted">Get started by creating your first commercial tenant profile.</p>
              <Button onClick={() => setOpen(true)} className="mt-5">
                <UserPlusIcon className="h-4 w-4" /> Create First Tenant
              </Button>
            </div>
          ) : (
            <Table>
              <THead>
                <TH className="pl-5">Tenant Name</TH>
                <TH>Business Name</TH>
                <TH>Property Address</TH>
                <TH>Monthly Rent</TH>
                <TH>Lease Status</TH>
                <TH className="pr-5 text-right">Actions</TH>
              </THead>
              <TBody>
                {filtered.map((t) => (
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
                    <TD className="font-mono font-medium">{formatCurrency(t.monthlyRent || 0)}</TD>
                    <TD>
                      <LeaseBadge status={t.leaseStatus || 'ACTIVE'} />
                    </TD>
                    <TD className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tenants/${t.id}`)}>
                        View case <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewTenantDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchTenantsData}
      />
    </div>
  );
}