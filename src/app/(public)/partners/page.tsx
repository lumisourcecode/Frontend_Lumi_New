import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-3xl font-bold">Become a Lumi Partner</h1>
        <p className="mt-2 text-sm text-indigo-100">
          For nursing homes, aged care providers, disability support services, and health organizations.
          Lumi handles dispatch, transport operations, compliance controls, and billing visibility.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Lumi Assurance</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Bulk bookings for many clients from one portal.</li>
            <li>Real-time monitoring of client pickup/drop-off status.</li>
            <li>Driver verification and compliance checks built in.</li>
            <li>Consolidated invoices and transparent monthly reporting.</li>
            <li>Dedicated account support for escalations and planning.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Partner Enquiry</h2>
          <div className="mt-4 grid gap-3">
            <Input placeholder="Organization name" />
            <Input placeholder="Primary contact" />
            <Input placeholder="Work email" type="email" />
            <Input placeholder="Phone" />
            <Select>
              <option>Organization type: Aged Care</option>
              <option>Organization type: Disability Support</option>
              <option>Organization type: Healthcare Facility</option>
              <option>Organization type: Community Program</option>
            </Select>
            <Textarea placeholder="Tell us your transport volume and service regions" />
            <div className="flex flex-wrap gap-2">
              <Button>Submit Partnership Request</Button>
              <Button variant="outline">Open Partner Login</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
