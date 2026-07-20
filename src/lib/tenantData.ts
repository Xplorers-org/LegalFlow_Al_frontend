import type { PaymentStatus } from './mockData';

export interface TenantTransaction {
  id: string;
  receipt: string;
  invoice: string;
  amount: number;
  paidDate: string;
  gateway: string;
  status: 'paid';
  transactionId: string;
}

export const tenantTransactions: TenantTransaction[] = [
{ id: 'tx1', receipt: 'RCT-2026-0738', invoice: 'INV-2026-0410', amount: 207000, paidDate: '2026-05-05', gateway: 'PayHere', status: 'paid', transactionId: 'PH-51289948' },
{ id: 'tx2', receipt: 'RCT-2026-0691', invoice: 'INV-2026-0401', amount: 207000, paidDate: '2026-04-05', gateway: 'PayHere', status: 'paid', transactionId: 'PH-51120463' },
{ id: 'tx3', receipt: 'RCT-2026-0610', invoice: 'INV-2026-0394', amount: 207000, paidDate: '2026-03-05', gateway: 'PayHere', status: 'paid', transactionId: 'PH-50977214' }];


export const tenantInvoices: Array<{
  id: string;
  number: string;
  amount: number;
  serviceCharge: number;
  dueDate: string;
  status: Exclude<PaymentStatus, 'failed'>;
  gatewayRef: string;
}> = [
{ id: 'tenant-i1', number: 'INV-2026-0413', amount: 185000, serviceCharge: 22000, dueDate: '2026-07-05', status: 'pending', gatewayRef: 'pg_lfA91m20' },
{ id: 'tenant-i2', number: 'INV-2026-0412', amount: 185000, serviceCharge: 22000, dueDate: '2026-06-05', status: 'overdue', gatewayRef: 'pg_lf9F2a41' },
{ id: 'tenant-i3', number: 'INV-2026-0410', amount: 185000, serviceCharge: 22000, dueDate: '2026-05-05', status: 'paid', gatewayRef: 'pg_lf07ad90' },
{ id: 'tenant-i4', number: 'INV-2026-0408', amount: 185000, serviceCharge: 22000, dueDate: '2026-04-05', status: 'paid', gatewayRef: 'pg_lf65bb10' }];