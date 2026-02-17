import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function DriverDocumentsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#151E6C] to-[#3D96C8] text-white">
        <h1 className="text-2xl font-bold">Documents Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Upload and manage compliance documents, reminders, and verification status.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Upload Document</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Select>
            <option>Driver License</option>
            <option>Police Check</option>
            <option>NDIS Worker Screening</option>
            <option>Manual Handling</option>
            <option>CPR / First Aid</option>
          </Select>
          <Input type="date" />
          <Input type="file" />
        </div>
        <Button className="mt-3">Submit for Verification</Button>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Document Status</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Driver License - Expires 2028-09-12 <Badge tone="certified">Verified</Badge></div>
          <div className="rounded-xl border border-slate-200 p-3">Police Check - Expires 2027-03-18 <Badge tone="certified">Verified</Badge></div>
          <div className="rounded-xl border border-slate-200 p-3">NDIS Worker Screening - Expires 2026-03-01 <Badge tone="pending">Renewal Due</Badge></div>
        </div>
      </Card>
    </div>
  );
}
