import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentRosterPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#152168] to-[#2F90BE] text-white">
        <h1 className="text-2xl font-bold">Roster & Coordination</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Plan daily and weekly transport rosters for facilities, carers, and client groups.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Roster Block</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input type="date" />
          <Select>
            <option>Morning Window</option>
            <option>Afternoon Window</option>
            <option>Evening Window</option>
          </Select>
          <Select>
            <option>Facility: Lakeside Nursing Home</option>
            <option>Facility: North Mental Health Outreach</option>
          </Select>
          <Input placeholder="Expected clients count" />
          <Input placeholder="Pickup zone" />
          <Input placeholder="Drop-off zone" />
          <Textarea className="md:col-span-3" placeholder="Coordination notes for drivers and carers" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Roster Block</Button>
          <Button variant="outline">Assign Preferred Drivers</Button>
          <Button variant="outline">Save as Weekly Template</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Roster Health</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Monday AM - Capacity 92% (optimal)</div>
          <div className="rounded-xl border border-slate-200 p-3">Wednesday PM - Capacity 118% (add extra vehicles)</div>
          <div className="rounded-xl border border-slate-200 p-3">Friday PM - Capacity 74% (available buffer)</div>
        </div>
      </Card>
    </div>
  );
}
