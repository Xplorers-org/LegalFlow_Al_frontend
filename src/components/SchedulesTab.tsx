import { Building2Icon, ReceiptTextIcon, SparklesIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Table, THead, TH, TBody, TR, TD } from './ui/Table';
import { formatCurrency } from '../lib/utils';

interface PremisesScheduleCardProps {
  firstSchedule: {
    physical_address?: string;
    assessment_number?: string;
    local_authority?: string;
    lot_plan_reference?: string;
    extent?: string;
    permitted_use?: string;
  };
}

export function PremisesScheduleCard({ firstSchedule }: PremisesScheduleCardProps) {
  return (
    <Card className="md:col-span-2 lg:col-span-3 border-primary-soft">
      <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Building2Icon className="h-4 w-4" /> First Schedule: Description of Demised Premises
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-5">
        <div className="rounded-lg bg-background border border-border p-3">
          <p className="text-xs text-muted font-semibold uppercase">Physical Address</p>
          <p className="mt-1 text-sm font-medium text-foreground">{firstSchedule?.physical_address || "N/A"}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3">
          <p className="text-xs text-muted font-semibold uppercase">Assessment Number</p>
          <p className="mt-1 text-sm font-medium text-foreground">{firstSchedule?.assessment_number || "N/A"}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3">
          <p className="text-xs text-muted font-semibold uppercase">Local Authority</p>
          <p className="mt-1 text-sm font-medium text-foreground">{firstSchedule?.local_authority || "N/A"}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 sm:col-span-2">
          <p className="text-xs text-muted font-semibold uppercase">Lot & Plan Reference</p>
          <p className="mt-1 text-sm font-medium text-foreground">{firstSchedule?.lot_plan_reference || "N/A"}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3">
          <p className="text-xs text-muted font-semibold uppercase">Extent / Size</p>
          <p className="mt-1 text-sm font-medium text-foreground">{firstSchedule?.extent || "N/A"}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 sm:col-span-2 lg:col-span-3">
          <p className="text-xs text-muted font-semibold uppercase">Permitted Use</p>
          <p className="mt-1 text-sm font-medium text-foreground">{firstSchedule?.permitted_use || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface RentScheduleCardProps {
  secondSchedule: {
    base_rent?: number;
    building_security?: number;
    common_area_cleaning?: number;
    common_area_lighting?: number;
    elevator_lift_maintenance?: number;
    annual_escalation?: string;
  };
  monthlyRent: number;
  serviceCharge: number;
  paymentDay?: number;
  gracePeriodDays?: number;
  interestRatePa?: number;
}

export function RentScheduleCard({
  secondSchedule,
  monthlyRent,
  serviceCharge,
  paymentDay,
  gracePeriodDays,
  interestRatePa,
}: RentScheduleCardProps) {
  return (
    <Card className="lg:col-span-2 border-primary-soft">
      <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <ReceiptTextIcon className="h-4 w-4" /> Second Schedule: Rent & Service Charge Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Base monthly Rent</p>
            <p className="mt-1 text-base font-mono font-bold text-foreground">
              {secondSchedule?.base_rent ? formatCurrency(secondSchedule.base_rent) : formatCurrency(monthlyRent)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Security Charge</p>
            <p className="mt-1 text-base font-mono font-bold text-foreground">
              {secondSchedule?.building_security ? formatCurrency(secondSchedule.building_security) : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Common Area Cleaning</p>
            <p className="mt-1 text-base font-mono font-medium text-foreground">
              {secondSchedule?.common_area_cleaning ? formatCurrency(secondSchedule.common_area_cleaning) : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Common Area Lighting</p>
            <p className="mt-1 text-base font-mono font-medium text-foreground">
              {secondSchedule?.common_area_lighting ? formatCurrency(secondSchedule.common_area_lighting) : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Elevator Maintenance</p>
            <p className="mt-1 text-base font-mono font-medium text-foreground">
              {secondSchedule?.elevator_lift_maintenance ? formatCurrency(secondSchedule.elevator_lift_maintenance) : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-primary-soft/20 p-3">
            <p className="text-xs text-primary font-bold">Total Service Charges</p>
            <p className="mt-1 text-base font-mono font-bold text-primary">
              {formatCurrency(serviceCharge)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Due Date</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {paymentDay ? `${paymentDay}th day of each calendar month` : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted font-semibold">Grace Period</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {gracePeriodDays ? `${gracePeriodDays} calendar days from the Due Date` : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3 col-span-2">
            <p className="text-xs text-muted font-semibold">Late Payment Interest</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {interestRatePa ? `${interestRatePa}% per annum, compounding monthly on the Outstanding Balance` : "N/A"}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <p className="text-xs text-muted font-semibold uppercase">Annual Rent Escalation Terms</p>
          <p className="mt-1 text-sm font-medium text-foreground">{secondSchedule?.annual_escalation || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface UtilitiesScheduleCardProps {
  thirdSchedule: {
    electricity_provider?: string;
    electricity_account_no?: string;
    water_provider?: string;
    water_account_no?: string;
    liability_for_consumption?: string;
    recovery_of_arrears_on_termination?: string;
  };
}

export function UtilitiesScheduleCard({ thirdSchedule }: UtilitiesScheduleCardProps) {
  return (
    <Card className="border-primary-soft">
      <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <SparklesIcon className="h-4 w-4" /> Third Schedule: Utility Account Bindings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="rounded-lg border border-border p-3.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground">Electricity Provider</span>
            <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">
              {thirdSchedule?.electricity_provider?.includes("LECO") ? "LECO" : "CEB"}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            {thirdSchedule?.electricity_provider || "Ceylon Electricity Board"}
          </p>
          <p className="text-xs text-muted mt-1 font-mono">
            Acct: {thirdSchedule?.electricity_account_no || "N/A"}
          </p>
        </div>

        <div className="rounded-lg border border-border p-3.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground">Water Provider</span>
            <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info">NWSDB</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            {thirdSchedule?.water_provider || "National Water Supply & Drainage Board"}
          </p>
          <p className="text-xs text-muted mt-1 font-mono">
            Acct: {thirdSchedule?.water_account_no || "N/A"}
          </p>
        </div>

        <div className="rounded-lg border border-border p-3.5 bg-background/50">
          <p className="text-xs text-muted font-semibold uppercase">Liability for Consumption</p>
          <p className="mt-1.5 text-xs font-medium text-foreground">
            {thirdSchedule?.liability_for_consumption || "Lessee, exclusively, from the Commencement Date"}
          </p>
        </div>

        <div className="rounded-lg border border-border p-3.5 bg-background/50">
          <p className="text-xs text-muted font-semibold uppercase">Recovery of Arrears on Termination</p>
          <p className="mt-1.5 text-xs font-medium text-foreground">
            {thirdSchedule?.recovery_of_arrears_on_termination || "Firstly from the Security Deposit (Clause 8); balance recoverable by civil action (Clause 6.5)"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface UtilityStatementsTableProps {
  utilityBills: any[];
}

export function UtilityStatementsTable({ utilityBills }: UtilityStatementsTableProps) {
  return (
    <Card className="lg:col-span-2 border-primary-soft">
      <CardHeader className="border-b border-border bg-primary-soft/10 py-3.5">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <ReceiptTextIcon className="h-4 w-4" /> Third Schedule: Utility Statements & Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 px-0 pb-0">
        {utilityBills.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            No utility bill statements parsed yet. Bills will appear here automatically when received by n8n.
          </div>
        ) : (
          <Table>
            <THead>
              <TH className="pl-4">Provider</TH>
              <TH>Account No</TH>
              <TH>Amount</TH>
              <TH>Due Date</TH>
              <TH className="pr-4 text-right">Status</TH>
            </THead>
            <TBody>
              {utilityBills.map((bill) => (
                <TR key={bill.id}>
                  <TD className="pl-4 font-semibold">
                    {bill.utility_type === 'ELECTRICITY' ? 'Electricity' : 'Water'}
                  </TD>
                  <TD className="font-mono text-xs text-muted">{bill.account_number}</TD>
                  <TD className="font-mono font-medium text-foreground">{formatCurrency(bill.amount)}</TD>
                  <TD className="text-muted">
                    {new Date(bill.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TD>
                  <TD className="pr-4 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      bill.status === 'PAID' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                    }`}>
                      <span className={`h-1 w-1 rounded-full ${bill.status === 'PAID' ? 'bg-success' : 'bg-warning'}`} />
                      {bill.status === 'PAID' ? 'Paid' : 'Pending'}
                    </span>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
