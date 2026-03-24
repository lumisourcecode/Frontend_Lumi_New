"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Trip = {
  id: string;
  state: string;
  booking_id?: string;
  pickup: string;
  dropoff: string;
  rider_id?: string;
  driver_id?: string;
  rider_name?: string;
  driver_name?: string;
  created_at: string;
  scheduled_at: string;
  admin_quality_notes?: string | null;
};

export default function AdminTripsHistoryPage() {
  const searchParams = useSearchParams();
  const highlightTripId = (searchParams.get("trip") ?? "").trim();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchClient, setSearchClient] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [searchTripId, setSearchTripId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const session = getAuthSession();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchClient.trim()), 350);
    return () => clearTimeout(t);
  }, [searchClient]);

  useEffect(() => {
    const fromUrl = (searchParams.get("trip") ?? "").trim();
    if (fromUrl && !searchTripId) setSearchTripId(fromUrl);
  }, [searchParams, searchTripId]);

  const tripsPath = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("state", filterStatus);
    if (debouncedQ) params.set("q", debouncedQ);
    const tid = searchTripId.trim();
    if (tid) {
      if (/^[0-9a-f-]{36}$/i.test(tid)) params.set("tripId", tid);
      else params.set("q", tid);
    }
    if (filterDate) {
      params.set("from", new Date(`${filterDate}T00:00:00`).toISOString());
      params.set("to", new Date(`${filterDate}T23:59:59.999`).toISOString());
    }
    params.set("limit", "500");
    const qs = params.toString();
    return `/admin/trips${qs ? `?${qs}` : "?limit=500"}`;
  }, [filterStatus, debouncedQ, searchTripId, filterDate]);

  const refetch = useCallback(() => {
    if (!session?.accessToken) return;
    apiJson<{ items: Trip[] }>(tripsPath, undefined, session.accessToken, { timeoutMs: 90_000 })
      .then((r) => {
        setTrips(r.items);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [session?.accessToken, tripsPath]);

  useEffect(() => {
    if (!session?.accessToken) return;
    refetch();
  }, [session?.accessToken, tripsPath, refetch]);

  async function updateTripState(tripId: string, state: string) {
    if (!session?.accessToken) return;
    setUpdating(tripId);
    try {
      await apiJson(`/admin/trips/${tripId}/state`, {
        method: "PATCH",
        body: JSON.stringify({ state }),
      }, session.accessToken);
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setUpdating(null);
    }
  }

  if (!session?.accessToken) {
    return (
      <div className="space-y-4">
        <Card className="bg-[var(--color-primary)] text-white">
          <h1 className="text-2xl font-bold">Client Trip History</h1>
        </Card>
        <Card>
          <p className="text-red-600">Please login as admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Client Trip History</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Full journey history for riders and clients, including route details, funding source, and event timeline.
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Search & filters</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Filters are applied on the server. Open a row from Bookings via “Open trip” to deep-link with <code className="rounded bg-slate-100 px-1">?trip=…</code>.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Input placeholder="Rider, driver, route, trip ID…" value={searchClient} onChange={(e) => setSearchClient(e.target.value)} />
          <Input placeholder="Trip UUID (exact)" value={searchTripId} onChange={(e) => setSearchTripId(e.target.value)} />
          <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} title="Scheduled date" />
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Assigned">Assigned</option>
            <option value="InProgress">In Progress</option>
            <option value="pending_assignment">Pending</option>
          </Select>
        </div>
        <p className="mt-2 text-xs text-slate-500">Showing {trips.length} trips</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trip History</h2>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Trip</th>
                <th className="py-2 pr-3">Rider</th>
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2 pr-3">Route</th>
                <th className="py-2 pr-3">Scheduled</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => {
                const rowHighlight = highlightTripId && trip.id === highlightTripId;
                return (
                  <tr key={trip.id} className={`border-b ${rowHighlight ? "bg-amber-50" : ""}`}>
                    <td className="py-2 pr-3 font-medium text-slate-900">
                      <Link href={`/admin/trips-history?trip=${encodeURIComponent(trip.id)}`} className="font-mono text-xs text-[var(--color-primary)] hover:underline">
                        {String(trip.id).slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-2 pr-3">
                      {trip.rider_id ? (
                        <Link href={`/admin/users/${trip.rider_id}`} className="text-[var(--color-primary)] hover:underline">
                          {trip.rider_name || "-"}
                        </Link>
                      ) : (
                        trip.rider_name || "-"
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {trip.driver_id ? (
                        <Link href={`/admin/users/${trip.driver_id}`} className="text-[var(--color-primary)] hover:underline">
                          {trip.driver_name || "Unassigned"}
                        </Link>
                      ) : (
                        trip.driver_name || "Unassigned"
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-600">{trip.pickup} → {trip.dropoff}</td>
                    <td className="py-2 pr-3">{trip.scheduled_at ? new Date(trip.scheduled_at).toLocaleString() : "—"}</td>
                    <td className="py-2 pr-3">{new Date(trip.created_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={trip.state === "Completed" ? "certified" : trip.state === "Cancelled" ? "danger" : "pending"}>{trip.state}</Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/reviews?trip=${encodeURIComponent(trip.id)}`}>
                          <Button variant="outline" size="sm">Quality</Button>
                        </Link>
                        {trip.state !== "Completed" && trip.state !== "Cancelled" && (
                          <>
                            <Button size="sm" disabled={updating === trip.id} onClick={() => updateTripState(trip.id, "Completed")}>
                              Complete
                            </Button>
                            <Button size="sm" variant="danger" disabled={updating === trip.id} onClick={() => updateTripState(trip.id, "Cancelled")}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {trips.length === 0 ? <p className="py-4 text-sm text-slate-500">No trips match these filters.</p> : null}
        </div>
      </Card>
    </div>
  );
}
