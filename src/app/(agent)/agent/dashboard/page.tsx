import { Badge, Button, Card } from "@/components/ui/primitives";

export default function AgentDashboardPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#141B63] via-[#2A2E9A] to-[#1178A6] text-white">
        <h1 className="text-2xl font-bold">Partner Operations Dashboard</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Manage transport for nursing homes, aged care, disability support, and mental care clients in one place.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Clients Enrolled</p><p className="text-2xl font-bold text-[#141B63]">286</p></Card>
        <Card><p className="text-xs text-slate-500">Rides Today</p><p className="text-2xl font-bold text-[#141B63]">72</p></Card>
        <Card><p className="text-xs text-slate-500">In Transit</p><p className="text-2xl font-bold text-[#141B63]">18</p></Card>
        <Card><p className="text-xs text-slate-500">Pending Approvals</p><p className="text-2xl font-bold text-amber-700">9</p></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Today&apos;s Transport Overview</h2>
          <div className="mt-3 h-72 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            Live map placeholder: facility pickups, active trips, and ETA monitoring.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Book New Ride</Button>
            <Button variant="outline">Plan Weekly Schedule</Button>
            <Button variant="outline">Bulk Upload Manifest</Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Facility Alerts</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-800">2 clients need mobility profile update</div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-800">5 rides eligible for recurring plan save</div>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-800">1 pickup delay requires coordinator follow-up</div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Care Team Snapshot</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">Lakeside Nursing Home <Badge tone="certified">Active</Badge></div>
            <div className="rounded-xl border border-slate-200 p-3">North Mental Health Outreach <Badge tone="certified">Active</Badge></div>
            <div className="rounded-xl border border-slate-200 p-3">Sunrise Disability Hub <Badge tone="pending">Review</Badge></div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Action Queue</h3>
          <div className="mt-3 grid gap-2">
            <Button variant="outline">Approve Draft Travel Plans</Button>
            <Button variant="outline">Send Family Trip Updates</Button>
            <Button variant="outline">Review Missed / Rescheduled Trips</Button>
            <Button variant="outline">Export Daily Coordination Report</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
