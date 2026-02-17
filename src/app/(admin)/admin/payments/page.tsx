import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

const payments = [
  {
    id: "PMT-7781",
    client: "Ava Smith",
    source: "Auto (NDIS Claim)",
    amount: "$68.00",
    status: "Confirmed",
    confirmation: "System matched",
  },
  {
    id: "PMT-7779",
    client: "Lakeside Aged Care",
    source: "Manual Bank Transfer",
    amount: "$2,180.00",
    status: "Pending",
    confirmation: "Awaiting receipt",
  },
  {
    id: "PMT-7773",
    client: "Leo Khan",
    source: "Card (Private Pay)",
    amount: "$52.00",
    status: "Failed",
    confirmation: "Retry required",
  },
];

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Payments & Confirmation</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track automatic and manual payments, reconcile exceptions, and confirm receipts with full audit trail.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Auto Confirmed</p>
          <p className="text-2xl font-bold text-emerald-700">$182,430</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Manual Pending</p>
          <p className="text-2xl font-bold text-amber-700">$9,420</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Failed Transactions</p>
          <p className="text-2xl font-bold text-red-700">14</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Refund Queue</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">5</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Manual Payment Confirmation</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Payment ID / Invoice" />
          <Input placeholder="Payer name" />
          <Input placeholder="Amount" />
          <Select>
            <option>Method: Bank transfer</option>
            <option>Method: Cash</option>
            <option>Method: Card terminal</option>
          </Select>
          <Input className="md:col-span-2" placeholder="Transaction reference" />
          <Input type="date" />
          <Select>
            <option>Status: Pending confirmation</option>
            <option>Status: Confirmed</option>
            <option>Status: Rejected</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Confirmation notes" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Confirm Manual Payment</Button>
          <Button variant="outline">Upload Receipt</Button>
          <Button variant="outline">Send Confirmation Notification</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Payment Status Table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Confirmation</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="py-2 pr-3 font-medium text-slate-900">{payment.id}</td>
                  <td className="py-2 pr-3">{payment.client}</td>
                  <td className="py-2 pr-3">{payment.source}</td>
                  <td className="py-2 pr-3">{payment.amount}</td>
                  <td className="py-2 pr-3">
                    <Badge
                      tone={
                        payment.status === "Confirmed"
                          ? "certified"
                          : payment.status === "Pending"
                            ? "pending"
                            : "danger"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3 text-xs text-slate-600">{payment.confirmation}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Open Details</Button>
                      <Button variant="outline">Retry / Resolve</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
