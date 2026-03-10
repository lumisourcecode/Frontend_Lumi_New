"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { haversineKm } from "@/lib/distance";

type Booking = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  scheduled_at: string;
  status: string;
  rider_name?: string;
  trip_id?: string;
  trip_state?: string;
  driver_name?: string;
  driver_email?: string;
};

export default function PartnerLiveOperationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let out = filter === "all"
      ? bookings
      : filter === "pending"
        ? bookings.filter((b) => b.status === "pending_matching" || b.trip_state === "pending_assignment")
        : filter === "active"
          ? bookings.filter((b) => b.trip_state && !["Completed", "Cancelled"].includes(b.trip_state))
          : bookings.filter((b) => b.trip_state === "Completed");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      out = out.filter((b) =>
        (b.rider_name || "").toLowerCase().includes(q) ||
        (b.id || "").toLowerCase().includes(q) ||
        (b.pickup || "").toLowerCase().includes(q) ||
        (b.dropoff || "").toLowerCase().includes(q),
      );
    }
    return out;
  }, [bookings, filter, searchQuery]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Booking[] }>("/partner/bookings", undefined, session.accessToken)
      .then((r) => setBookings(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#131D64] to-[#2A90BC] text-white">
        <h1 className="text-2xl font-bold">Live Operations</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Monitor active trips, client status, ETA alerts, and intervention needs in real time.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Operations Board</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Client Name / Trip ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending Pickup</option>
            <option value="active">In Transit</option>
            <option value="completed">Completed</option>
          </Select>
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh Board</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No trips match the filter.</p>
          ) : (
            filtered.slice(0, 20).map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-200 p-3 text-sm min-w-[200px]">
                <p className="font-medium">{b.rider_name || "Rider"}</p>
                <p className="text-slate-600">{b.pickup} → {b.dropoff}</p>
                <p className="text-xs text-slate-500">
                  Driver: <strong>{b.driver_name || b.driver_email || "Unassigned"}</strong>
                  {" • "}
                  Distance:{" "}
                  {b.pickup_lat != null && b.pickup_lng != null && b.dropoff_lat != null && b.dropoff_lng != null
                    ? `${haversineKm(b.pickup_lat, b.pickup_lng, b.dropoff_lat, b.dropoff_lng).toFixed(1)} km`
                    : "—"}
                </p>
                <p className="text-xs text-slate-500">{new Date(b.scheduled_at).toLocaleString()}</p>
                <Badge tone={b.trip_state === "Completed" ? "certified" : "pending"} className="mt-2">
                  {b.trip_state || b.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-[var(--color-primary)]">Intervention Queue</h3>
        <p className="mt-2 text-sm text-slate-600">Escalation and alerts coming soon.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Notify Care Team</Button>
          <Button variant="outline">Escalate to Admin Dispatch</Button>
        </div>
      </Card>
    </div>
  );
}
