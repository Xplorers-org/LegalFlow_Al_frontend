
import React from 'react';
import { toast } from 'sonner';
import { DownloadIcon, EyeIcon, ReceiptTextIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { PaymentBadge } from '../components/ui/Badge';
import { tenantTransactions } from '../lib/tenantData';
import { formatCurrency } from '../lib/utils';

export function TenantHistory() {return <div><PageHeader title="Payment History" description="Completed payments and downloadable receipts." /><Card><div className="flex items-center justify-between border-b border-border p-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><ReceiptTextIcon className="h-4 w-4 text-primary" /> Completed payments</div><span className="text-xs text-muted">{tenantTransactions.length} receipts</span></div><CardContent className="px-0 pb-0"><Table><THead><TH className="pl-5">Receipt Number</TH><TH>Invoice</TH><TH>Amount</TH><TH>Paid Date</TH><TH>Gateway</TH><TH>Status</TH><TH className="pr-5 text-right">Actions</TH></THead><TBody>{tenantTransactions.map((transaction) => <TR key={transaction.id}><TD className="pl-5 font-mono font-medium">{transaction.receipt}</TD><TD className="font-mono text-muted">{transaction.invoice}</TD><TD className="font-mono font-medium">{formatCurrency(transaction.amount)}</TD><TD className="text-muted">{new Date(transaction.paidDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TD><TD className="text-muted">{transaction.gateway}</TD><TD><PaymentBadge status="paid" /></TD><TD className="pr-5 text-right"><div className="flex justify-end gap-1"><Button variant="outline" size="sm" onClick={() => toast('Opening receipt preview…')}><EyeIcon className="h-3.5 w-3.5" /> View</Button><Button variant="ghost" size="icon" aria-label="Download receipt" onClick={() => toast.success('Receipt downloaded')}><DownloadIcon className="h-4 w-4" /></Button></div></TD></TR>)}</TBody></Table></CardContent></Card></div>;}