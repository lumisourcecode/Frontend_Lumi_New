import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentDataHubPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#112161] to-[#2A85BD] text-white">
        <h1 className="text-2xl font-bold">Data Hub</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Centralize imports, exports, client datasets, and audit-safe data sharing.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Import Data</h2>
          <div className="mt-3 grid gap-3">
            <Select>
              <option>Import Type: Client Master List</option>
              <option>Import Type: Weekly Roster</option>
              <option>Import Type: Facility Contacts</option>
            </Select>
            <Input type="file" />
            <Textarea placeholder="Column mapping notes" />
            <Button>Validate & Import</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Export Data</h2>
          <div className="mt-3 grid gap-3">
            <Select>
              <option>Export: Full Client Registry</option>
              <option>Export: Trip History Pack</option>
              <option>Export: Invoice & Claims</option>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" />
              <Input type="date" />
            </div>
            <Button>Generate Export File</Button>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Data Governance</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Last successful import: 2026-02-16 09:42 AM</div>
          <div className="rounded-xl border border-slate-200 p-3">Failed rows in latest file: 3 (download error report)</div>
          <div className="rounded-xl border border-slate-200 p-3">PII access scope: Organization Admin + Compliance Officer</div>
        </div>
      </Card>
    </div>
  );
}
