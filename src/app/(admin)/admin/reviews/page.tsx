"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Trip = { id: string; state: string; rider_name?: string; driver_name?: string; pickup: string; dropoff: string; scheduled_at: string };

export default function AdminReviewsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Trip[] }>("/admin/trips", undefined, session.accessToken)
      .then((r) => setTrips(r.items.filter((t) => t.state === "Completed")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = trips.length;
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Driver Reviews & Quality</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Review rider feedback, monitor service quality trends, and assign corrective actions.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Completed Trips</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : completedCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Reviewable</p>
          <p className="text-2xl font-bold text-emerald-700">{loading ? "—" : completedCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Rating System</p>
          <p className="text-2xl font-bold text-slate-600">Coming soon</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Escalated</p>
          <p className="text-2xl font-bold text-red-700">0</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Open Review Case</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Review ID / Trip ID" />
          <Input placeholder="Driver name" />
          <Select>
            <option>Case: Coaching required</option>
            <option>Case: Rider callback</option>
            <option>Case: Escalate to compliance</option>
          </Select>
          <Select>
            <option>Priority: Medium</option>
            <option>Priority: High</option>
            <option>Priority: Low</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Quality review notes" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Action Plan</Button>
          <Button variant="outline">Schedule Driver Coaching</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Completed Trips (Reviewable)</h2>
        <p className="mt-1 text-xs text-slate-600">Trip ratings coming soon. Showing completed trips.</p>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : trips.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No completed trips yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Driver</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.slice(0, 20).map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-2 pr-3 font-mono text-xs">{String(t.id).slice(0, 8)}...</td>
                    <td className="py-2 pr-3">{t.rider_name || "-"}</td>
                    <td className="py-2 pr-3">{t.driver_name || "-"}</td>
                    <td className="py-2 pr-3">{t.pickup} → {t.dropoff}</td>
                    <td className="py-2 pr-3">{new Date(t.scheduled_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      <Badge tone="certified">{t.state}</Badge>
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
