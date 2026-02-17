import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentBookingsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#17206D] to-[#2790BE] text-white">
        <h1 className="text-2xl font-bold">Book on Behalf of Clients</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Create individual or group bookings for residents/patients with support preferences.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Manual Client Booking</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Client Name" />
          <Input placeholder="NDIS / Internal ID" />
          <Select>
            <option>Facility: Lakeside Nursing Home</option>
            <option>Facility: Sunrise Disability Hub</option>
          </Select>
          <Input placeholder="Pickup Address" className="md:col-span-2" />
          <Input placeholder="Drop-off Address" />
          <Input type="date" />
          <Input type="time" />
          <Select>
            <option>Wheelchair-accessible</option>
            <option>Door-to-door assistance</option>
            <option>Companion required</option>
          </Select>
          <Select>
            <option>Trip Type: Medical</option>
            <option>Trip Type: Community</option>
            <option>Trip Type: Therapy</option>
          </Select>
          <Textarea className="md:col-span-3" placeholder="Care instructions for driver/support team" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Booking</Button>
          <Button variant="outline">Save as Template</Button>
          <Button variant="outline">Duplicate for Return Trip</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Book at Once</h2>
        <p className="mt-2 text-sm text-slate-700">
          Create batched bookings for a ward, wing, or therapy group in a single flow.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Start Multi-Client Batch Booking</Button>
          <Button variant="outline">Import Existing Weekly Plan</Button>
        </div>
      </Card>
    </div>
  );
}
