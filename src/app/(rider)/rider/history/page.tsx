import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function RiderHistoryPage() {
  const trips = [
    {
      id: "TRIP-5521",
      date: "2026-02-12",
      from: "Glen Waverley",
      to: "Monash Medical Centre",
      status: "Completed",
      payment: "Visa •••• 4242",
      total: "$46.00",
      invoice: "INV-5521.pdf",
    },
    {
      id: "TRIP-5478",
      date: "2026-02-08",
      from: "Home",
      to: "Eastside Dialysis Unit",
      status: "Completed",
      payment: "NDIS Claim + Card",
      total: "$62.00",
      invoice: "INV-5478.pdf",
    },
    {
      id: "TRIP-5410",
      date: "2026-02-01",
      from: "Home",
      to: "Community Centre",
      status: "Cancelled",
      payment: "No charge",
      total: "$0.00",
      invoice: "-",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">My Travel History</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Detailed ride records, bills, payments, subsidy details, and downloadable invoices.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Filter & Search</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" />
          <Input type="date" />
          <Select defaultValue="all">
            <option value="all">All status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="in-progress">In Progress</option>
          </Select>
          <Input placeholder="Search by trip ID / location" />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trips & Billing</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Trip ID</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Route</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b">
                  <td className="py-2 pr-3">{trip.id}</td>
                  <td className="py-2 pr-3">{trip.date}</td>
                  <td className="py-2 pr-3">
                    {trip.from} to {trip.to}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge tone={trip.status === "Completed" ? "certified" : "pending"}>{trip.status}</Badge>
                  </td>
                  <td className="py-2 pr-3">{trip.payment}</td>
                  <td className="py-2 pr-3">{trip.total}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">View Details</Button>
                      <Button variant="outline">Download Invoice</Button>
                      <Button>Rebook</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Payment Summary</h3>
          <p className="mt-2 text-sm text-slate-700">This month paid: $108.00</p>
          <p className="text-sm text-slate-700">NDIS/MPTP subsidy used: $58.00</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Outstanding Bills</h3>
          <p className="mt-2 text-sm text-slate-700">No pending bills.</p>
          <Button variant="outline" className="mt-3">
            Billing Center
          </Button>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Rewards</h3>
          <p className="mt-2 text-sm text-slate-700">
            Refer friends and get <strong>$20 off</strong> your next ride.
          </p>
          <Button className="mt-3">Invite & Earn</Button>
        </Card>
      </div>
    </div>
  );
}
