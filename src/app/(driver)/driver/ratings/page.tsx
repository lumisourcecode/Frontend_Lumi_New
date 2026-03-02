import { Button, Card, Input, Select } from "@/components/ui/primitives";

export default function DriverRatingsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#141E66] to-[#2393C6] text-white">
        <h1 className="text-2xl font-bold">Ratings & Reviews</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track service quality, rider feedback, and coaching insights.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Average Rating</p><p className="text-2xl font-bold text-[#141E66]">4.92</p></Card>
        <Card><p className="text-xs text-slate-500">5-star Trips</p><p className="text-2xl font-bold text-[#141E66]">92%</p></Card>
        <Card><p className="text-xs text-slate-500">Compliments</p><p className="text-2xl font-bold text-[#141E66]">148</p></Card>
        <Card><p className="text-xs text-slate-500">Coaching Flags</p><p className="text-2xl font-bold text-amber-700">2</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Feedback Feed</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input type="date" />
          <Select>
            <option>All scores</option>
            <option>5 stars</option>
            <option>Below 4 stars</option>
          </Select>
          <Input placeholder="Search by trip ID" />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">TRP-101 | 5.0 | Very kind and punctual.</div>
          <div className="rounded-xl border border-slate-200 p-3">TRP-097 | 4.0 | Great service, slight delay.</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline">Request Review Clarification</Button>
          <Button variant="outline">Open Coaching Guide</Button>
        </div>
      </Card>
    </div>
  );
}
