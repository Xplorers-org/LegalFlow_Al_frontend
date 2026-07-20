
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'failed';
export type CaseStatus = 'healthy' | 'monitoring' | 'overdue' | 'legal-review' | 'action-required';
export type LeaseStatus = 'active' | 'expiring' | 'expired';
export type DocumentType = 'Payment Reminder' | 'Notice to Quit' | 'Letter of Demand';
export type DocumentStatus = 'draft' | 'pending-approval' | 'approved';

export interface Tenant {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  property: string;
  monthlyRent: number;
  serviceCharge: number;
  dueDay: number;
  leaseStart: string;
  leaseEnd: string;
  interestRate: number;
  leaseStatus: LeaseStatus;
}

export interface Invoice {
  id: string;
  number: string;
  tenantId: string;
  tenant: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  gatewayRef: string;
}

export interface CaseRecord {
  id: string;
  tenantId: string;
  tenant: string;
  business: string;
  property: string;
  outstanding: number;
  status: CaseStatus;
  recommendedAction: string;
  monthsInDefault: number;
  confidence: number;
}

export interface TimelineMonth {
  month: string;
  status: PaymentStatus;
  amount: number;
}

export interface LegalDocument {
  id: string;
  type: DocumentType;
  tenant: string;
  tenantId: string;
  property: string;
  generated: string;
  status: DocumentStatus;
  legalBasis: string;
}

export const tenants: Tenant[] = [
{
  id: 't1',
  name: 'Nimal Perera',
  business: 'Perera Textiles (Pvt) Ltd',
  email: 'nimal@pereratextiles.lk',
  phone: '+94 77 123 4567',
  property: 'Unit 4B, Liberty Plaza, Colombo 03',
  monthlyRent: 185000,
  serviceCharge: 22000,
  dueDay: 5,
  leaseStart: '2023-01-01',
  leaseEnd: '2026-12-31',
  interestRate: 2,
  leaseStatus: 'active'
},
{
  id: 't2',
  name: 'Ayesha Fernando',
  business: 'Bloom Café & Bakery',
  email: 'ayesha@bloomcafe.lk',
  phone: '+94 71 998 2210',
  property: 'Ground Floor, Marino Mall, Colombo 04',
  monthlyRent: 240000,
  serviceCharge: 35000,
  dueDay: 1,
  leaseStart: '2022-06-01',
  leaseEnd: '2025-05-31',
  interestRate: 1.5,
  leaseStatus: 'expiring'
},
{
  id: 't3',
  name: 'Rajiv Wickramasinghe',
  business: 'Apex Legal Chambers',
  email: 'rajiv@apexlegal.lk',
  phone: '+94 76 445 7788',
  property: 'Level 7, World Trade Center, Colombo 01',
  monthlyRent: 420000,
  serviceCharge: 60000,
  dueDay: 10,
  leaseStart: '2024-02-01',
  leaseEnd: '2029-01-31',
  interestRate: 2.5,
  leaseStatus: 'active'
},
{
  id: 't4',
  name: 'Dilani Jayawardena',
  business: 'Colombo Dental Suites',
  email: 'dilani@colombodental.lk',
  phone: '+94 70 332 1145',
  property: 'Unit 12, Crescat Boulevard, Colombo 03',
  monthlyRent: 310000,
  serviceCharge: 40000,
  dueDay: 3,
  leaseStart: '2023-09-01',
  leaseEnd: '2026-08-31',
  interestRate: 2,
  leaseStatus: 'active'
},
{
  id: 't5',
  name: 'Suresh Gunaratne',
  business: 'TechHive Coworking',
  email: 'suresh@techhive.lk',
  phone: '+94 77 660 9931',
  property: 'Floor 3, Orion City, Colombo 09',
  monthlyRent: 275000,
  serviceCharge: 30000,
  dueDay: 7,
  leaseStart: '2021-11-01',
  leaseEnd: '2024-10-31',
  interestRate: 3,
  leaseStatus: 'expired'
}];


export const cases: CaseRecord[] = [
{
  id: 'c1',
  tenantId: 't1',
  tenant: 'Nimal Perera',
  business: 'Perera Textiles (Pvt) Ltd',
  property: 'Unit 4B, Liberty Plaza',
  outstanding: 414000,
  status: 'action-required',
  recommendedAction: 'Issue Letter of Demand',
  monthsInDefault: 2,
  confidence: 92
},
{
  id: 'c2',
  tenantId: 't5',
  tenant: 'Suresh Gunaratne',
  business: 'TechHive Coworking',
  property: 'Floor 3, Orion City',
  outstanding: 915000,
  status: 'legal-review',
  recommendedAction: 'Issue Notice to Quit',
  monthsInDefault: 3,
  confidence: 88
},
{
  id: 'c3',
  tenantId: 't2',
  tenant: 'Ayesha Fernando',
  business: 'Bloom Café & Bakery',
  property: 'Ground Floor, Marino Mall',
  outstanding: 137500,
  status: 'overdue',
  recommendedAction: 'Send Payment Reminder',
  monthsInDefault: 1,
  confidence: 79
},
{
  id: 'c4',
  tenantId: 't4',
  tenant: 'Dilani Jayawardena',
  business: 'Colombo Dental Suites',
  property: 'Unit 12, Crescat Boulevard',
  outstanding: 0,
  status: 'monitoring',
  recommendedAction: 'Monitor — partial risk',
  monthsInDefault: 0,
  confidence: 64
},
{
  id: 'c5',
  tenantId: 't3',
  tenant: 'Rajiv Wickramasinghe',
  business: 'Apex Legal Chambers',
  property: 'Level 7, WTC',
  outstanding: 0,
  status: 'healthy',
  recommendedAction: 'No action required',
  monthsInDefault: 0,
  confidence: 98
}];


export const invoices: Invoice[] = [
{ id: 'i1', number: 'INV-2026-0412', tenantId: 't1', tenant: 'Perera Textiles', amount: 207000, dueDate: '2026-06-05', status: 'overdue', gatewayRef: 'pg_9f2a41cc' },
{ id: 'i2', number: 'INV-2026-0411', tenantId: 't1', tenant: 'Perera Textiles', amount: 207000, dueDate: '2026-07-05', status: 'overdue', gatewayRef: 'pg_1b77de20' },
{ id: 'i3', number: 'INV-2026-0409', tenantId: 't2', tenant: 'Bloom Café', amount: 275000, dueDate: '2026-07-01', status: 'partial', gatewayRef: 'pg_5cd0a913' },
{ id: 'i4', number: 'INV-2026-0407', tenantId: 't3', tenant: 'Apex Legal', amount: 480000, dueDate: '2026-07-10', status: 'paid', gatewayRef: 'pg_a01e88f7' },
{ id: 'i5', number: 'INV-2026-0405', tenantId: 't4', tenant: 'Colombo Dental', amount: 350000, dueDate: '2026-07-03', status: 'pending', gatewayRef: 'pg_772bc4a1' },
{ id: 'i6', number: 'INV-2026-0402', tenantId: 't5', tenant: 'TechHive', amount: 305000, dueDate: '2026-05-07', status: 'failed', gatewayRef: 'pg_e33f0921' },
{ id: 'i7', number: 'INV-2026-0399', tenantId: 't3', tenant: 'Apex Legal', amount: 480000, dueDate: '2026-06-10', status: 'paid', gatewayRef: 'pg_bb190dd4' }];


export const timeline: TimelineMonth[] = [
{ month: 'Jan 2026', status: 'paid', amount: 207000 },
{ month: 'Feb 2026', status: 'paid', amount: 207000 },
{ month: 'Mar 2026', status: 'paid', amount: 207000 },
{ month: 'Apr 2026', status: 'partial', amount: 100000 },
{ month: 'May 2026', status: 'paid', amount: 207000 },
{ month: 'Jun 2026', status: 'overdue', amount: 207000 },
{ month: 'Jul 2026', status: 'overdue', amount: 207000 }];


export const documents: LegalDocument[] = [
{ id: 'd1', type: 'Letter of Demand', tenant: 'Nimal Perera', tenantId: 't1', property: 'Unit 4B, Liberty Plaza', generated: '2026-07-18', status: 'pending-approval', legalBasis: 'Rent Act No. 7 of 1972, s.4; Recovery of Possession Act No. 1 of 2023' },
{ id: 'd2', type: 'Notice to Quit', tenant: 'Suresh Gunaratne', tenantId: 't5', property: 'Floor 3, Orion City', generated: '2026-07-15', status: 'approved', legalBasis: 'Recovery of Possession of Premises Given on Lease Act No. 1 of 2023, s.3' },
{ id: 'd3', type: 'Payment Reminder', tenant: 'Ayesha Fernando', tenantId: 't2', property: 'Ground Floor, Marino Mall', generated: '2026-07-14', status: 'approved', legalBasis: 'Lease Agreement Clause 6.2 — Payment Terms' },
{ id: 'd4', type: 'Letter of Demand', tenant: 'Suresh Gunaratne', tenantId: 't5', property: 'Floor 3, Orion City', generated: '2026-07-02', status: 'approved', legalBasis: 'Rent Act No. 7 of 1972, s.4; Civil Procedure Code s.377' },
{ id: 'd5', type: 'Payment Reminder', tenant: 'Nimal Perera', tenantId: 't1', property: 'Unit 4B, Liberty Plaza', generated: '2026-06-20', status: 'approved', legalBasis: 'Lease Agreement Clause 6.2 — Payment Terms' }];


export const upcomingDeadlines = [
{ tenant: 'Colombo Dental Suites', amount: 350000, due: 'in 2 days', date: 'Jul 21, 2026' },
{ tenant: 'Apex Legal Chambers', amount: 480000, due: 'in 6 days', date: 'Jul 25, 2026' },
{ tenant: 'Bloom Café & Bakery', amount: 275000, due: 'in 9 days', date: 'Jul 28, 2026' },
{ tenant: 'TechHive Coworking', amount: 305000, due: 'in 12 days', date: 'Jul 31, 2026' }];


export const activity = [
{ icon: 'payment', text: 'Payment received from Apex Legal Chambers', meta: 'LKR 480,000 · INV-2026-0407', time: '2h ago' },
{ icon: 'ai', text: 'AI compliance analysis completed for Perera Textiles', meta: 'Recommendation: Letter of Demand', time: '5h ago' },
{ icon: 'overdue', text: 'Overdue case opened for TechHive Coworking', meta: '3 consecutive defaults detected', time: 'Yesterday' },
{ icon: 'document', text: 'Notice to Quit approved for Suresh Gunaratne', meta: 'Finalized by you', time: 'Yesterday' },
{ icon: 'reminder', text: 'Payment reminder sent to Bloom Café & Bakery', meta: 'via Email & WhatsApp', time: '2 days ago' }];