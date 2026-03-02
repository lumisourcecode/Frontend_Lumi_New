import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentPlansPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#141F68] to-[#2B90BE] text-white">
        <h1 className="text-2xl font-bold">Travel Plans & Recurring Schedules</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Build weekly/monthly transport plans for clients based on treatment, therapy, and community routines.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Care Travel Plan</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Plan Name" />
          <Input placeholder="Client Group / Ward" />
          <Select>
            <option>Frequency: Weekly</option>
            <option>Frequency: Fortnightly</option>
            <option>Frequency: Monthly</option>
          </Select>
          <Input type="date" />
          <Input type="date" />
          <Select>
            <option>Priority: High</option>
            <option>Priority: Medium</option>
            <option>Priority: Low</option>
          </Select>
          <Textarea className="md:col-span-3" placeholder="Plan logic (e.g. Tue/Thu dialysis, Fri community outings)" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Plan</Button>
          <Button variant="outline">Preview Capacity Impact</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Active Plans</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">
            Dialysis Group Plan - Mon/Wed/Fri 9AM <Badge tone="certified">Active</Badge>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            Mental Health Outreach Sessions - Tue/Thu 2PM <Badge tone="certified">Active</Badge>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            Community Participation Fridays <Badge tone="pending">Draft</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
