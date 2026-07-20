
import React from 'react';
import { cn } from '../../lib/utils';
import type { PaymentStatus, CaseStatus, LeaseStatus, DocumentStatus } from '../../lib/mockData';

const paymentMap: Record<PaymentStatus, {label: string;cls: string;dot: string;}> = {
  paid: { label: 'Paid', cls: 'bg-success-soft text-success', dot: 'bg-success' },
  pending: { label: 'Pending', cls: 'bg-info-soft text-info', dot: 'bg-info' },
  overdue: { label: 'Overdue', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  partial: { label: 'Partial', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  failed: { label: 'Failed', cls: 'bg-slate2/10 text-slate2', dot: 'bg-slate2' }
};

const caseMap: Record<CaseStatus, {label: string;cls: string;dot: string;}> = {
  healthy: { label: 'Healthy', cls: 'bg-success-soft text-success', dot: 'bg-success' },
  monitoring: { label: 'Monitoring', cls: 'bg-info-soft text-info', dot: 'bg-info' },
  overdue: { label: 'Overdue', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  'legal-review': { label: 'Legal Review', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  'action-required': { label: 'Action Required', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' }
};

const leaseMap: Record<LeaseStatus, {label: string;cls: string;dot: string;}> = {
  active: { label: 'Active', cls: 'bg-success-soft text-success', dot: 'bg-success' },
  expiring: { label: 'Expiring Soon', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  expired: { label: 'Expired', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' }
};

const docMap: Record<DocumentStatus, {label: string;cls: string;dot: string;}> = {
  draft: { label: 'Draft', cls: 'bg-slate2/10 text-slate2', dot: 'bg-slate2' },
  'pending-approval': { label: 'Pending Approval', cls: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  approved: { label: 'Approved', cls: 'bg-success-soft text-success', dot: 'bg-success' }
};

function Base({ label, cls, dot }: {label: string;cls: string;dot: string;}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </span>);

}

export function PaymentBadge({ status }: {status: PaymentStatus;}) {
  return <Base {...paymentMap[status]} />;
}
export function CaseBadge({ status }: {status: CaseStatus;}) {
  return <Base {...caseMap[status]} />;
}
export function LeaseBadge({ status }: {status: LeaseStatus;}) {
  return <Base {...leaseMap[status]} />;
}
export function DocBadge({ status }: {status: DocumentStatus;}) {
  return <Base {...docMap[status]} />;
}