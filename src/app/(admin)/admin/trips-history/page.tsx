import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

const journeys = [
  {
    tripId: "TR-5402",
    client: "Ava Smith",
    pickup: "Box Hill",
    dropoff: "St Vincent's Hospital",
    date: "2026-02-14",
    mode: "NDIS Assisted",
    status: "Completed",
    fare: "$68.00",
  },
  {
    tripId: "TR-5401",
    client: "Leo Khan",
    pickup: "Footscray",
    dropoff: "Sunshine Medical Centre",
    date: "2026-02-13",
    mode: "Private Pay",
    status: "Completed",
    fare: "$52.00",
  },
  {
    tripId: "TR-5399",
    client: "Amelia Ross",
    pickup: "Reservoir",
    dropoff: "Carlton Rehab",
    date: "2026-02-13",
    mode: "Partner Program",
    status: "No Show",
    fare: "$0.00",
  },
];

export default function AdminTripsHistoryPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Client Trip History</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Full journey history for riders and clients, including route details, funding source, and event timeline.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Search History</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Input placeholder="Client name / ID" />
          <Input placeholder="Trip ID" />
          <Input type="date" />
          <Select>
            <option>All funding types</option>
            <option>NDIS</option>
            <option>Private Pay</option>
            <option>Partner</option>
          </Select>
          <Select>
            <option>All statuses</option>
            <option>Completed</option>
            <option>No Show</option>
            <option>Cancelled</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Apply Filters</Button>
          <Button variant="outline">Export Client Timeline PDF</Button>
          <Button variant="outline">Share with Case Manager</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Journey Log</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Trip</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Route</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Fare</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journeys.map((trip) => (
                <tr key={trip.tripId} className="border-b">
                  <td className="py-2 pr-3 font-medium text-slate-900">{trip.tripId}</td>
                  <td className="py-2 pr-3">{trip.client}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600">
                    {trip.pickup} → {trip.dropoff}
                  </td>
                  <td className="py-2 pr-3">{trip.date}</td>
                  <td className="py-2 pr-3">{trip.mode}</td>
                  <td className="py-2 pr-3">{trip.fare}</td>
                  <td className="py-2 pr-3">
                    <Badge tone={trip.status === "Completed" ? "certified" : "pending"}>{trip.status}</Badge>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Open Timeline</Button>
                      <Button variant="outline">Billing Record</Button>
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
