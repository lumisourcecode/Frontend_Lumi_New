"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Trip = { id: string; state: string; pickup: string; dropoff: string; scheduled_at: string; rider_name?: string };

export default function DriverEarningsPage() {
  const [items, setItems] = useState<Trip[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Trip[]; completedCount: number }>("/driver/earnings", undefined, session.accessToken)
      .then((r) => {
        setItems(r.items);
        setCompletedCount(r.completedCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#12195E] to-[#2A2E9A] text-white">
        <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track gross/net earnings, incentives, adjustments, and cashout schedule.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Completed Trips</p><p className="text-2xl font-bold text-[#12195E]">{completedCount}</p></Card>
        <Card><p className="text-xs text-slate-500">Total Trips</p><p className="text-2xl font-bold text-[#12195E]">{items.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Settled</p><p className="text-2xl font-bold text-emerald-700">{completedCount}</p></Card>
        <Card><p className="text-xs text-slate-500">Available for Payout</p><p className="text-2xl font-bold text-[#12195E]">{completedCount} trips</p><p className="text-xs text-slate-600">Payout integration coming soon</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Payout Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled>Instant Cashout (coming soon)</Button>
          <Button variant="outline" disabled>Weekly Bank Payout</Button>
          <Button variant="outline" disabled>Download Statement</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trip Earnings Log</h2>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No trips yet. Complete trips to see earnings.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-2 pr-3 font-mono text-xs">{String(t.id).slice(0, 8)}...</td>
                    <td className="py-2 pr-3">{new Date(t.scheduled_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">{t.pickup} → {t.dropoff}</td>
                    <td className="py-2 pr-3">{t.rider_name || "-"}</td>
                    <td className="py-2">
                      <Badge tone={t.state === "Completed" ? "certified" : "pending"}>{t.state}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
