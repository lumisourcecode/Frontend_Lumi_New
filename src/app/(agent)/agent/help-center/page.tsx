import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentHelpCenterPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#141F68] to-[#2A8DBC] text-white">
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Support for coordinators, facilities, and care teams managing high-volume transport.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Support Request</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Select>
            <option>Issue Type: Booking</option>
            <option>Issue Type: Billing</option>
            <option>Issue Type: Client Data</option>
            <option>Issue Type: Urgent Escalation</option>
          </Select>
          <Input placeholder="Reference ID (optional)" />
          <Select>
            <option>Priority: Normal</option>
            <option>Priority: High</option>
            <option>Priority: Critical</option>
          </Select>
          <Textarea className="md:col-span-3" placeholder="Describe your issue, including affected clients/trips." />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Submit Ticket</Button>
          <Button variant="outline">Start Live Chat</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Operational Contacts</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Partner Operations Desk: 1300 586 474</div>
          <div className="rounded-xl border border-slate-200 p-3">Account Manager: partnercare@lumiride.com.au</div>
          <div className="rounded-xl border border-slate-200 p-3">Urgent Escalation: dispatch.ops@lumiride.com.au</div>
        </div>
      </Card>
    </div>
  );
}
