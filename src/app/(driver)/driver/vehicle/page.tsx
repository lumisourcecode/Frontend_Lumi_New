import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function DriverVehiclePage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#1A216A] to-[#2183B8] text-white">
        <h1 className="text-2xl font-bold">Vehicle & Equipment</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Keep vehicle details, maintenance, accessibility equipment, and permits up to date.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Vehicle Profile</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input defaultValue="Kia Carnival" />
            <Input defaultValue="1AB-2CD" />
            <Input defaultValue="White" />
            <Select>
              <option>Wheelchair-capable: Yes</option>
              <option>Wheelchair-capable: No</option>
            </Select>
            <Input placeholder="Registration expiry" type="date" />
            <Input placeholder="Insurance expiry" type="date" />
          </div>
          <Button className="mt-3">Save Vehicle Details</Button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Maintenance Log</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">Last service: 2026-01-12 <Badge tone="certified">Passed</Badge></div>
            <div className="rounded-xl border border-slate-200 p-3">Tire check: 2026-02-01 <Badge tone="certified">Passed</Badge></div>
            <div className="rounded-xl border border-slate-200 p-3">Lift inspection due: 2026-02-20 <Badge tone="pending">Due Soon</Badge></div>
          </div>
          <Textarea className="mt-3" placeholder="Report vehicle issue or damage..." />
          <Button className="mt-3" variant="outline">Submit Maintenance Ticket</Button>
        </Card>
      </div>
    </div>
  );
}
