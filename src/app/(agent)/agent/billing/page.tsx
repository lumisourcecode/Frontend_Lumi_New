"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Booking = { id: string; pickup: string; dropoff: string; scheduled_at: string; status: string; trip_state?: string };

export default function PartnerBillingPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Booking[] }>("/partner/bookings", undefined, session.accessToken)
      .then((r) => setItems(r.items))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const dt = new Date(item.scheduled_at);
      if (from && dt < new Date(from)) return false;
      if (to && dt > new Date(`${to}T23:59:59`)) return false;
      if (status !== "all" && item.status !== status) return false;
      return true;
    });
  }, [items, from, to, status]);

  const totals = useMemo(() => {
    const monthlySpend = filtered.length * 22;
    const pending = filtered.filter((b) => b.status !== "completed").length * 22;
    const completed = filtered.filter((b) => b.status === "completed").length * 22;
    return { monthlySpend, pending, completed };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#132060] to-[#257DB9] text-white">
        <h1 className="text-2xl font-bold">Partner Billing & Spend</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track invoices, commissions, budgets, and claim-ready records for all facilities.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Estimated Spend</p><p className="text-2xl font-bold text-[#132060]">${totals.monthlySpend.toLocaleString()}</p></Card>
        <Card><p className="text-xs text-slate-500">Pending Invoices</p><p className="text-2xl font-bold text-amber-700">${totals.pending.toLocaleString()}</p></Card>
        <Card><p className="text-xs text-slate-500">Commission Earned</p><p className="text-2xl font-bold text-emerald-700">${Math.round(totals.completed * 0.08).toLocaleString()}</p></Card>
        <Card><p className="text-xs text-slate-500">Paid This Month</p><p className="text-2xl font-bold text-[#132060]">${totals.completed.toLocaleString()}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Invoice Explorer</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending_matching">Pending</option>
            <option value="completed">Paid</option>
          </Select>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {filtered.slice(0, 25).map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-3">
              INV-{booking.id.slice(0, 6)} | {booking.pickup} {"->"} {booking.dropoff} | $22{" "}
              <Badge tone={booking.status === "completed" ? "certified" : "pending"}>
                {booking.status === "completed" ? "Paid" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Export Billing Pack</Button>
          <Button variant="outline">Send Reminder</Button>
        </div>
      </Card>
    </div>
  );
}
