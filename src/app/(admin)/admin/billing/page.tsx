import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function AdminBillingPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Billing & Collections</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Automated invoicing, reconciliation, and payment messaging for riders, partners, and plan managers.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Invoices This Month</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">1,248</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Auto-generated</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">1,132</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Paid</p>
          <p className="text-2xl font-bold text-emerald-700">$182,430</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Outstanding</p>
          <p className="text-2xl font-bold text-amber-700">$24,190</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create / Send Invoice</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Trip ID" />
          <Input placeholder="Client name" />
          <Select>
            <option>NDIS</option>
            <option>Private Pay</option>
            <option>Partner Invoice</option>
          </Select>
          <Input placeholder="Amount" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Generate Xero-ready Invoice</Button>
          <Button variant="outline">Send to Plan Manager</Button>
          <Button variant="outline">Mark as Paid + Notify</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Recent Billing Events</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Invoice</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-3">INV-8821</td>
                <td className="py-2 pr-3">Ava Smith</td>
                <td className="py-2 pr-3">NDIS</td>
                <td className="py-2 pr-3">$68.00</td>
                <td className="py-2 pr-3"><Badge tone="certified">Paid</Badge></td>
                <td className="py-2">Receipt sent by SMS + Email</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">INV-8812</td>
                <td className="py-2 pr-3">Lakeside Aged Care</td>
                <td className="py-2 pr-3">Partner</td>
                <td className="py-2 pr-3">$2,180.00</td>
                <td className="py-2 pr-3"><Badge tone="pending">Pending</Badge></td>
                <td className="py-2">Reminder queued</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
