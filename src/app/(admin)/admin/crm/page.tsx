import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

const contacts = [
  { name: "Ava Smith", type: "Rider", email: "ava@example.com" },
  { name: "Care Team 14", type: "Carer", email: "care14@provider.com" },
  { name: "Plan Managers AU", type: "Plan Manager", email: "claims@planmanagers.au" },
  { name: "NDIS Liaison", type: "Stakeholder", email: "ndis.ops@example.com" },
];

export default function AdminCrmPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">CRM & Relationship Management</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Unified relationship layer for riders, carers, plan managers, drivers, and partner organizations.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create CRM Record</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Full name / Organization" />
          <Select>
            <option>Rider</option>
            <option>Carer</option>
            <option>Driver</option>
            <option>Partner</option>
            <option>Plan Manager</option>
          </Select>
          <Input placeholder="Email" />
          <Input placeholder="Phone" />
          <Select>
            <option>Status: Active</option>
            <option>Status: Prospect</option>
            <option>Status: Escalated</option>
          </Select>
          <Input placeholder="Preferred language" />
          <Textarea className="md:col-span-3" placeholder="Additional notes or context" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Add Contact</Button>
          <Button variant="outline">Assign Account Owner</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Contact Directory</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.email} className="border-b">
                  <td className="py-2 pr-4">{contact.name}</td>
                  <td className="py-2 pr-4">{contact.type}</td>
                  <td className="py-2 pr-4">{contact.email}</td>
                  <td className="py-2 pr-4"><Badge tone="certified">Active</Badge></td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Open Record</Button>
                      <Button variant="outline">Send Message</Button>
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
