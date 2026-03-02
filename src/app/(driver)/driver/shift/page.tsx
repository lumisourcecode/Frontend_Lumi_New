"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function DriverShiftPage() {
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);

  const durationMins = useMemo(() => {
    if (!clockInTime || !clockOutTime) return 0;
    return Math.max(Math.round((clockOutTime.getTime() - clockInTime.getTime()) / 60000), 0);
  }, [clockInTime, clockOutTime]);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#131B63] to-[#1B9EC5] text-white">
        <h1 className="text-xl font-bold">Shift Management</h1>
        <p className="mt-1 text-sm text-cyan-100">Manage schedule, breaks, and planned availability windows.</p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-[var(--color-primary)]">Live Shift Controls</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => setClockInTime(new Date())}>Clock In</Button>
          <Button variant="outline" onClick={() => setClockOutTime(new Date())}>
            Clock Out
          </Button>
          <Button variant="outline">Start Break</Button>
          <Button variant="outline">End Break</Button>
        </div>
        <p className="mt-3 text-sm text-slate-700">Shift Duration: {durationMins} mins</p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Weekly Availability Planner</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input type="date" />
            <Select>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </Select>
            <Input placeholder="Preferred service zone" />
            <Select>
              <option>Accept long rides: Yes</option>
              <option>Accept long rides: No</option>
            </Select>
          </div>
          <Button className="mt-3">Save Availability</Button>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Shift Insights</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">Best earning window: 7:00 AM - 10:00 AM</div>
            <div className="rounded-xl bg-slate-50 p-3">Recommended zone today: South-East Metro</div>
            <div className="rounded-xl bg-slate-50 p-3">Idle time this week: 1h 43m</div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--color-primary)]">Driver Profile Verification</h2>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            NDIS Worker Screening: <Badge tone="certified">Certified</Badge>
          </p>
          <p>
            Police Check: <Badge tone="pending">Pending</Badge>
          </p>
        </div>
      </Card>
    </div>
  );
}
