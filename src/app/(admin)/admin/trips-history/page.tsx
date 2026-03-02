"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Trip = {
  id: string;
  state: string;
  pickup: string;
  dropoff: string;
  rider_name?: string;
  driver_name?: string;
  created_at: string;
};

export default function AdminTripsHistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchClient, setSearchClient] = useState("");
  const [searchTripId, setSearchTripId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const session = getAuthSession();

  const filteredTrips = useMemo(() => {
    let out = trips;
    if (searchClient) {
      const q = searchClient.toLowerCase();
      out = out.filter((t) => (t.rider_name || "").toLowerCase().includes(q) || (t.id || "").toLowerCase().includes(q));
    }
    if (searchTripId) {
      const q = searchTripId.toLowerCase();
      out = out.filter((t) => (t.id || "").toLowerCase().includes(q));
    }
    if (filterDate) {
      out = out.filter((t) => new Date(t.created_at).toISOString().slice(0, 10) === filterDate);
    }
    if (filterStatus !== "all") {
      out = out.filter((t) => t.state === filterStatus);
    }
    return out;
  }, [trips, searchClient, searchTripId, filterDate, filterStatus]);

  function refetch() {
    if (!session?.accessToken) return;
    apiJson<{ items: Trip[] }>("/admin/trips", undefined, session.accessToken)
      .then((r) => setTrips(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }

  useEffect(() => {
    if (!session?.accessToken) {
      setError("Please login as admin.");
      return;
    }
    refetch();
  }, [session?.accessToken]);

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

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Client Trip History</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Full journey history for riders and clients, including route details, funding source, and event timeline.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Search History</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Input placeholder="Client name / ID" value={searchClient} onChange={(e) => setSearchClient(e.target.value)} />
          <Input placeholder="Trip ID" value={searchTripId} onChange={(e) => setSearchTripId(e.target.value)} />
          <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Assigned">Assigned</option>
            <option value="InProgress">In Progress</option>
            <option value="pending_assignment">Pending</option>
          </Select>
        </div>
        <p className="mt-2 text-xs text-slate-500">Showing {filteredTrips.length} of {trips.length} trips</p>
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
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="border-b">
                  <td className="py-2 pr-3 font-medium text-slate-900">{String(trip.id).slice(0, 8)}</td>
                  <td className="py-2 pr-3">{trip.rider_name || "-"}</td>
                  <td className="py-2 pr-3">{trip.driver_name || "Unassigned"}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600">{trip.pickup} → {trip.dropoff}</td>
                  <td className="py-2 pr-3">{new Date(trip.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3">
                    <Badge tone={trip.state === "Completed" ? "certified" : trip.state === "Cancelled" ? "danger" : "pending"}>{trip.state}</Badge>
                  </td>
                  <td className="py-2">
                    {trip.state !== "Completed" && trip.state !== "Cancelled" && (
                      <div className="flex gap-2">
                        <Button size="sm" disabled={updating === trip.id} onClick={() => updateTripState(trip.id, "Completed")}>
                          Complete
                        </Button>
                        <Button size="sm" variant="danger" disabled={updating === trip.id} onClick={() => updateTripState(trip.id, "Cancelled")}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
