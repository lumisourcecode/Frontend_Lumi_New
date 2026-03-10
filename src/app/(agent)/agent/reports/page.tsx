"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Stats = { clientsEnrolled: number; ridesToday: number; inTransit: number; pendingApprovals: number };
type Booking = { id: string; pickup: string; dropoff: string; status: string; scheduled_at: string };

export default function PartnerReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Stats>("/partner/stats", undefined, session.accessToken).then(setStats).catch(() => {});
    apiJson<{ items: Booking[] }>("/partner/bookings", undefined, session.accessToken).then((r) => setBookings(r.items)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const dt = new Date(b.scheduled_at);
      if (from && dt < new Date(from)) return false;
      if (to && dt > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [bookings, from, to]);

  const completed = filtered.filter((b) => b.status === "completed").length;
  const onTimeRate = filtered.length ? Math.round((completed / filtered.length) * 1000) / 10 : 0;

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#15206A] to-[#2A8DBD] text-white">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Measure utilization, on-time performance, spend, and care transport outcomes.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Total Trips</p><p className="text-2xl font-bold text-[#15206A]">{filtered.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Completion Rate</p><p className="text-2xl font-bold text-[#15206A]">{onTimeRate}%</p></Card>
        <Card><p className="text-xs text-slate-500">Clients Enrolled</p><p className="text-2xl font-bold text-emerald-700">{stats?.clientsEnrolled ?? "—"}</p></Card>
        <Card><p className="text-xs text-slate-500">In Transit</p><p className="text-2xl font-bold text-[#15206A]">{stats?.inTransit ?? "—"}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Report Builder</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
          </Select>
          <Select>
            <option>Report Type: Operations</option>
            <option>Report Type: Billing</option>
            <option>Report Type: Client Outcomes</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Generate Report</Button>
          <Button variant="outline">Export PDF</Button>
          <Button variant="outline">Export CSV</Button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {filtered.slice(0, 20).map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 p-3">
              {b.pickup} {"->"} {b.dropoff} • {new Date(b.scheduled_at).toLocaleString()} • {b.status}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
