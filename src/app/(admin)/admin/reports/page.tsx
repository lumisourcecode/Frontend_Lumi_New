import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

const reportLibrary = [
  {
    name: "Operations Executive Summary",
    frequency: "Daily",
    owner: "Operations",
    includes: "Trips, delays, incidents, driver utilization",
  },
  {
    name: "Billing + Receivables Report",
    frequency: "Daily",
    owner: "Finance",
    includes: "Invoices, aging, payment success rate",
  },
  {
    name: "Compliance Control Report",
    frequency: "Weekly",
    owner: "Compliance",
    includes: "Documents, training, audit exceptions",
  },
  {
    name: "Agent Portfolio Performance",
    frequency: "Weekly",
    owner: "Customer Success",
    includes: "Clients per agent, SLA, retention risk",
  },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Central reporting workspace for operational, financial, compliance, and customer performance data.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Reports Generated (30d)</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">184</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Scheduled Jobs</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">22</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Delivery Success</p>
          <p className="text-2xl font-bold text-emerald-700">98.2%</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pending Approvals</p>
          <p className="text-2xl font-bold text-amber-700">5</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Generate Report</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Select>
            <option>Type: Operations Summary</option>
            <option>Type: Billing & Receivables</option>
            <option>Type: Compliance</option>
            <option>Type: Agent Performance</option>
          </Select>
          <Input type="date" />
          <Input type="date" />
          <Select>
            <option>Format: PDF</option>
            <option>Format: CSV</option>
            <option>Format: XLSX</option>
          </Select>
          <Select>
            <option>Delivery: Download now</option>
            <option>Delivery: Email stakeholders</option>
            <option>Delivery: Save to report vault</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Generate</Button>
          <Button variant="outline">Schedule Weekly</Button>
          <Button variant="outline">Add to Executive Pack</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Report Library</h2>
        <div className="mt-3 space-y-3">
          {reportLibrary.map((report) => (
            <div key={report.name} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{report.name}</p>
                <Badge tone="certified">{report.frequency}</Badge>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                <p>Owner: {report.owner}</p>
                <p className="md:col-span-2">Includes: {report.includes}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline">Open Latest</Button>
                <Button variant="outline">Edit Schedule</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
