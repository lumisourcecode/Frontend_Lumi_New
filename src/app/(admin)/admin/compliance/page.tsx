import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function AdminCompliancePage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Compliance & Governance</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track audits, export mandatory files, and monitor workforce/document compliance.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Driver Documents</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">93%</p>
          <p className="text-xs text-slate-600">Up to date</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">MPTP Validation</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">100%</p>
          <p className="text-xs text-slate-600">Rules applied</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pending Audits</p>
          <p className="text-2xl font-bold text-amber-700">7</p>
          <p className="text-xs text-slate-600">Needs review</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Export Files</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Generate PRODA Bulk Claim CSV</Button>
          <Button variant="outline">Export MPTP DCP Trip Files</Button>
          <Button variant="outline">Download Audit Log</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Manual Compliance Check</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Driver / Rider ID" />
          <Select>
            <option>Document check</option>
            <option>Trip compliance</option>
            <option>Billing compliance</option>
          </Select>
          <Select>
            <option>Result: Pass</option>
            <option>Result: Pending</option>
            <option>Result: Failed</option>
          </Select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button>Save Compliance Note</Button>
          <Button variant="outline">Raise Escalation</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Latest Flags</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <Badge tone="pending">Pending</Badge> Driver D-221 police check expires in 9 days.
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
            <Badge tone="danger">Escalated</Badge> Billing mismatch detected in partner claim batch.
          </div>
        </div>
      </Card>
    </div>
  );
}
