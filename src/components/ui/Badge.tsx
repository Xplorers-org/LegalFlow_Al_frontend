import React from 'react';
import { cn } from '../../lib/utils';

const paymentMap = {
  paid: { label: 'Paid', cls: 'bg-success-soft text-success', dot: 'bg-success' },
  pending: { label: 'Pending', cls: 'bg-info-soft text-info', dot: 'bg-info' },
  overdue: { label: 'Overdue', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  partial: { label: 'Partial', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  failed: { label: 'Failed', cls: 'bg-slate2/10 text-slate2', dot: 'bg-slate2' }
};

const caseMap = {
  healthy: { label: 'Healthy', cls: 'bg-success-soft text-success', dot: 'bg-success' },
  monitoring: { label: 'Monitoring', cls: 'bg-info-soft text-info', dot: 'bg-info' },
  overdue: { label: 'Overdue', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  'legal-review': { label: 'Legal Review', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  'action-required': { label: 'Action Required', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' }
};

const leaseMap = {
  active: { label: 'Active', cls: 'bg-success-soft text-success', dot: 'bg-success' },
  expiring: { label: 'Expiring Soon', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  expired: { label: 'Expired', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' }
};

const docMap = {
  draft: { label: 'Draft', cls: 'bg-slate2/10 text-slate2', dot: 'bg-slate2' },
  'pending-approval': { label: 'Pending Approval', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  approved: { label: 'Approved', cls: 'bg-success-soft text-success', dot: 'bg-success' }
};

function Base({ label, cls, dot }: { label: string; cls: string; dot: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const normalized = status ? status.toLowerCase() : 'pending';
  const config = paymentMap[normalized as keyof typeof paymentMap] || {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending',
    cls: 'bg-info-soft text-info',
    dot: 'bg-info'
  };
  return <Base {...config} />;
}

export function CaseBadge({ status }: { status: string }) {
  const normalized = status ? status.toLowerCase() : 'monitoring';
  const config = caseMap[normalized as keyof typeof caseMap] || {
    label: status ? status.replace('_', ' ').replace('-', ' ').toUpperCase() : 'Open',
    cls: 'bg-warning-soft text-warning',
    dot: 'bg-warning'
  };
  return <Base {...config} />;
}

export function LeaseBadge({ status }: { status: string }) {
  const normalized = status ? status.toLowerCase() : 'active';
  const config = leaseMap[normalized as keyof typeof leaseMap] || {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Active',
    cls: 'bg-success-soft text-success',
    dot: 'bg-success'
  };
  return <Base {...config} />;
}

export function DocBadge({ status }: { status: string }) {
  const normalized = status ? status.toLowerCase() : 'draft';
  const config = docMap[normalized as keyof typeof docMap] || {
    label: status ? status.replace('-', ' ').toUpperCase() : 'Draft',
    cls: 'bg-slate2/10 text-slate2',
    dot: 'bg-slate2'
  };
  return <Base {...config} />;
}