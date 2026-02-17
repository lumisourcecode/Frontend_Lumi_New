import {
  Badge,
  Button,
  Card,
  Input,
  Select,
} from "@/components/ui/primitives";

export default function DriverDashboardPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#12195E] via-[#25309E] to-[#0072A8] text-white">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Daily operations overview with instant access to trips, earnings, safety, documents, and support.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Online Time</p>
          <p className="text-2xl font-bold text-[#12195E]">7h 23m</p>
          <p className="text-xs text-emerald-700">On target</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Trips Today</p>
          <p className="text-2xl font-bold text-[#12195E]">9</p>
          <p className="text-xs text-slate-600">2 in progress</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Net Earnings</p>
          <p className="text-2xl font-bold text-[#12195E]">$286.40</p>
          <p className="text-xs text-slate-600">After platform fees</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Acceptance Rate</p>
          <p className="text-2xl font-bold text-[#12195E]">98%</p>
          <p className="text-xs text-slate-600">Cancellation 1.2%</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Demand & Hotspots</h2>
          <div className="mt-3 h-64 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            Heatmap placeholder with surge/demand-style zones and recommended positioning.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Go to Recommended Zone</Button>
            <Button variant="outline">Set Destination Filter</Button>
            <Button variant="outline">Enable Auto-Accept (Safe Mode)</Button>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Quick Actions</h3>
          <div className="mt-3 grid gap-2">
            <Button>Start Shift</Button>
            <Button variant="outline">Take Break</Button>
            <Button variant="outline">Open Manifest</Button>
            <Button variant="outline">Instant Cashout</Button>
            <Button variant="danger">SOS Safety</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Upcoming Trips</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">
              TRP-130 | Clayton to St Kilda | 14 mins | <Badge tone="default">Wheelchair</Badge>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              TRP-131 | Oakleigh to Malvern | 21 mins | <Badge tone="default">Service Animal</Badge>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Driver Assistant</h3>
          <div className="mt-3 grid gap-3">
            <Input placeholder="Ask: best time to go online?" />
            <Select>
              <option>Recommendation: Stay in current zone</option>
              <option>Recommendation: Move 4km west</option>
            </Select>
            <Button variant="outline">Get Route Optimization Tip</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
