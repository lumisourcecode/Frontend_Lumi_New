import { Badge, Button, Card, Progress } from "@/components/ui/primitives";

export default function DriverIncentivesPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#1A1D73] to-[#2F8BC8] text-white">
        <h1 className="text-2xl font-bold">Incentives & Quests</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Uber/Doordash-style quests, streaks, and peak-hour bonuses tailored for Lumi shifts.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Current Quest</p>
          <p className="text-lg font-semibold text-[#1A1D73]">Complete 12 trips this week</p>
          <p className="mt-1 text-xs text-slate-600">Bonus: $90</p>
          <div className="mt-2">
            <Progress value={66} />
          </div>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Streak Bonus</p>
          <p className="text-lg font-semibold text-[#1A1D73]">3 on-time rides in a row</p>
          <p className="mt-1 text-xs text-slate-600">Current streak: 2</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Peak Boost</p>
          <p className="text-lg font-semibold text-[#1A1D73]">+1.3x</p>
          <p className="mt-1 text-xs text-slate-600">Active 7:00 AM - 9:00 AM</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Available Challenges</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">
            Weekend Hero: 20 rides Fri-Sun for $180 bonus <Badge tone="pending">In Progress</Badge>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            Early Bird: 5 trips before 9AM for $40 bonus <Badge tone="certified">Completed</Badge>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Opt into Weekend Quest</Button>
          <Button variant="outline">View Full Incentive Rules</Button>
        </div>
      </Card>
    </div>
  );
}
