import { Button, Card, Input, Select } from "@/components/ui/primitives";

export default function AgentLiveOperationsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#131D64] to-[#2A90BC] text-white">
        <h1 className="text-2xl font-bold">Live Operations</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Monitor active trips, client status, ETA alerts, and intervention needs in real time.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Operations Board</h2>
        <div className="mt-3 h-72 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
          Live trip board/map placeholder: pickup, in-transit, drop-off statuses.
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Client Name / Trip ID" />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
            <option>Sunrise Disability Hub</option>
          </Select>
          <Select>
            <option>All Statuses</option>
            <option>Pending Pickup</option>
            <option>In Transit</option>
            <option>Completed</option>
          </Select>
          <Button variant="outline">Refresh Board</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-[var(--color-primary)]">Intervention Queue</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl bg-amber-50 p-3">Trip BK-781 delayed by 11 minutes - notify family</div>
          <div className="rounded-xl bg-rose-50 p-3">SOS check needed for client transfer BK-784</div>
          <div className="rounded-xl bg-blue-50 p-3">Client special support note updated for BK-789</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Notify Care Team</Button>
          <Button variant="outline">Escalate to Admin Dispatch</Button>
        </div>
      </Card>
    </div>
  );
}
