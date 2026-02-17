import { Button, Card, Input, Select } from "@/components/ui/primitives";

export default function AgentReportsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#15206A] to-[#2A8DBD] text-white">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Measure utilization, on-time performance, spend, and care transport outcomes.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Total Trips (30d)</p><p className="text-2xl font-bold text-[#15206A]">1,842</p></Card>
        <Card><p className="text-xs text-slate-500">On-time Rate</p><p className="text-2xl font-bold text-[#15206A]">97.8%</p></Card>
        <Card><p className="text-xs text-slate-500">No-show Reduction</p><p className="text-2xl font-bold text-emerald-700">-22%</p></Card>
        <Card><p className="text-xs text-slate-500">Monthly Spend</p><p className="text-2xl font-bold text-[#15206A]">$41.2k</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Report Builder</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" />
          <Input type="date" />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
          </Select>
          <Select>
            <option>Report Type: Operations</option>
            <option>Report Type: Billing</option>
            <option>Report Type: Client Outcomes</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Generate Report</Button>
          <Button variant="outline">Export PDF</Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </Card>
    </div>
  );
}
