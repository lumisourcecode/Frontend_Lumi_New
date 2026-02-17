import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentClientsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#16206C] to-[#2A8CBC] text-white">
        <h1 className="text-2xl font-bold">Client Registry</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Add and manage residents/patients with full transport, support, and billing profiles.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Add New Client</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Client full name" />
          <Input placeholder="NDIS / Facility ID" />
          <Input placeholder="Date of Birth" type="date" />
          <Input placeholder="Primary contact" />
          <Input placeholder="Emergency contact" />
          <Select>
            <option>Support Level: Standard</option>
            <option>Support Level: High Assistance</option>
            <option>Support Level: Complex Needs</option>
          </Select>
          <Input placeholder="Pickup address" className="md:col-span-2" />
          <Input placeholder="Preferred destination" />
          <Select>
            <option>Mobility: Wheelchair</option>
            <option>Mobility: Companion Required</option>
            <option>Mobility: Service Animal</option>
          </Select>
          <Input placeholder="Plan manager email" />
          <Textarea className="md:col-span-3" placeholder="Care notes, triggers, support details" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Add Client</Button>
          <Button variant="outline">Save Draft Profile</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Client List</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Facility</th>
                <th className="py-2 pr-3">Support</th>
                <th className="py-2 pr-3">Trips (30d)</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-3">Grace P.</td>
                <td className="py-2 pr-3">Lakeside Nursing Home</td>
                <td className="py-2 pr-3">Wheelchair</td>
                <td className="py-2 pr-3">18</td>
                <td className="py-2 pr-3"><Badge tone="certified">Active</Badge></td>
                <td className="py-2"><Button variant="outline">Open Profile</Button></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">James T.</td>
                <td className="py-2 pr-3">Sunrise Disability Hub</td>
                <td className="py-2 pr-3">Companion Required</td>
                <td className="py-2 pr-3">12</td>
                <td className="py-2 pr-3"><Badge tone="pending">Review</Badge></td>
                <td className="py-2"><Button variant="outline">Open Profile</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
