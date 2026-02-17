import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function DriverEarningsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#12195E] to-[#2A2E9A] text-white">
        <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track gross/net earnings, incentives, adjustments, and cashout schedule.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Today Gross</p><p className="text-2xl font-bold text-[#12195E]">$326.40</p></Card>
        <Card><p className="text-xs text-slate-500">Platform Fee</p><p className="text-2xl font-bold text-[#12195E]">$40.00</p></Card>
        <Card><p className="text-xs text-slate-500">Bonuses</p><p className="text-2xl font-bold text-emerald-700">$18.00</p></Card>
        <Card><p className="text-xs text-slate-500">Net Pay</p><p className="text-2xl font-bold text-[#12195E]">$304.40</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Payout Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Instant Cashout</Button>
          <Button variant="outline">Weekly Bank Payout</Button>
          <Button variant="outline">Download Statement</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trip Earnings Log</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" />
          <Input type="date" />
          <Select>
            <option>All trips</option>
            <option>Completed</option>
            <option>Adjusted</option>
          </Select>
          <Input placeholder="Search trip ID" />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Trip</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Fare</th>
                <th className="py-2 pr-3">Bonus</th>
                <th className="py-2 pr-3">Net</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-2 pr-3">TRP-100</td><td className="py-2 pr-3">2026-02-15</td><td className="py-2 pr-3">$61.00</td><td className="py-2 pr-3">$4.00</td><td className="py-2 pr-3">$58.00</td><td className="py-2"><Badge tone="certified">Settled</Badge></td></tr>
              <tr className="border-b"><td className="py-2 pr-3">TRP-099</td><td className="py-2 pr-3">2026-02-15</td><td className="py-2 pr-3">$48.00</td><td className="py-2 pr-3">$0.00</td><td className="py-2 pr-3">$42.00</td><td className="py-2"><Badge tone="pending">Pending</Badge></td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
