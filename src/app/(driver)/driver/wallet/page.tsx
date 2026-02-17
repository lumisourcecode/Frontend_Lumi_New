import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function DriverWalletPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#0F1D62] to-[#3762C9] text-white">
        <h1 className="text-2xl font-bold">Wallet & Cashout</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Manage instant cashout, weekly payouts, bank details, and transaction history.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Available Balance</p><p className="text-2xl font-bold text-[#0F1D62]">$304.40</p></Card>
        <Card><p className="text-xs text-slate-500">Pending</p><p className="text-2xl font-bold text-[#0F1D62]">$86.00</p></Card>
        <Card><p className="text-xs text-slate-500">Cashout Fee</p><p className="text-2xl font-bold text-[#0F1D62]">$1.50</p></Card>
        <Card><p className="text-xs text-slate-500">Last Payout</p><p className="text-2xl font-bold text-[#0F1D62]">$1,812</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Cashout Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Instant Cashout</Button>
          <Button variant="outline">Schedule Weekly Payout</Button>
          <Button variant="outline">Download Tax Summary</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Banking Details</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Account Name" />
          <Input placeholder="BSB" />
          <Input placeholder="Account Number" />
          <Select>
            <option>Payout Frequency: Weekly</option>
            <option>Payout Frequency: Daily</option>
          </Select>
          <Input placeholder="ABN (optional)" />
          <Input placeholder="Tax File Number (masked)" />
        </div>
        <Button className="mt-3">Save Banking Settings</Button>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Transaction Feed</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">
            2026-02-16 | Instant Cashout | -$1.50 fee | <Badge tone="pending">Processing</Badge>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            2026-02-15 | Weekly Payout | +$1,812.00 | <Badge tone="certified">Settled</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
