import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function DriverSupportPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#111A5C] to-[#2A7EBC] text-white">
        <h1 className="text-2xl font-bold">Driver Support Hub</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Contact dispatch, safety, payroll, and technical support from one place.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Raise Support Ticket</h2>
          <div className="mt-3 grid gap-3">
            <Select>
              <option>Trip Issue</option>
              <option>Payment Issue</option>
              <option>Account Issue</option>
              <option>Safety Incident</option>
              <option>App Technical Problem</option>
            </Select>
            <Input placeholder="Trip ID (optional)" />
            <Textarea placeholder="Describe your issue in detail" />
            <Button>Submit Ticket</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Live Contacts</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">Dispatch Hotline: 1300 586 474</div>
            <div className="rounded-xl border border-slate-200 p-3">Safety Escalation: safety@lumiride.com.au</div>
            <div className="rounded-xl border border-slate-200 p-3">Payroll Support: payroll@lumiride.com.au</div>
            <div className="rounded-xl border border-slate-200 p-3">Technical Support: apphelp@lumiride.com.au</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="danger">Trigger SOS</Button>
            <Button variant="outline">Open In-app Chat</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
