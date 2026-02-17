import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function AgentBillingPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#132060] to-[#257DB9] text-white">
        <h1 className="text-2xl font-bold">Partner Billing & Spend</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track invoices, commissions, budgets, and claim-ready records for all facilities.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Monthly Spend</p><p className="text-2xl font-bold text-[#132060]">$41,220</p></Card>
        <Card><p className="text-xs text-slate-500">Pending Invoices</p><p className="text-2xl font-bold text-amber-700">$8,910</p></Card>
        <Card><p className="text-xs text-slate-500">Commission Earned</p><p className="text-2xl font-bold text-emerald-700">$4,560</p></Card>
        <Card><p className="text-xs text-slate-500">Paid This Month</p><p className="text-2xl font-bold text-[#132060]">$32,310</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Invoice Explorer</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" />
          <Input type="date" />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
          </Select>
          <Select>
            <option>All statuses</option>
            <option>Pending</option>
            <option>Paid</option>
          </Select>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">INV-9012 | Lakeside Nursing Home | $2,120 <Badge tone="pending">Pending</Badge></div>
          <div className="rounded-xl border border-slate-200 p-3">INV-9007 | Sunrise Disability Hub | $1,880 <Badge tone="certified">Paid</Badge></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Export Billing Pack</Button>
          <Button variant="outline">Send Reminder</Button>
        </div>
      </Card>
    </div>
  );
}
