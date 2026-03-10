"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { haversineKm } from "@/lib/distance";

export default function RiderHistoryPage() {
  const [bookings, setBookings] = useState<
    Array<{
      id: string;
      trip_id?: string;
      pickup: string;
      dropoff: string;
      pickup_lat?: number | null;
      pickup_lng?: number | null;
      dropoff_lat?: number | null;
      dropoff_lng?: number | null;
      scheduled_at: string;
      status: string;
      trip_state?: string;
      driver_name?: string;
      driver_email?: string;
      driver_id?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const session = getAuthSession();

  const filteredBookings = useMemo(() => {
    let out = bookings;
    if (filterStatus !== "all") {
      if (filterStatus === "completed") out = out.filter((b) => b.status.toLowerCase().includes("completed"));
      else if (filterStatus === "cancelled") out = out.filter((b) => b.status === "cancelled");
      else if (filterStatus === "in-progress") out = out.filter((b) => b.status !== "cancelled" && !b.status.toLowerCase().includes("completed"));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      out = out.filter((b) =>
        (b.pickup || "").toLowerCase().includes(q) ||
        (b.dropoff || "").toLowerCase().includes(q) ||
        (b.id || "").toLowerCase().includes(q) ||
        (b.trip_id ? String(b.trip_id).toLowerCase().includes(q) : false),
      );
    }
    return out;
  }, [bookings, filterStatus, searchQuery]);

  useEffect(() => {
    if (!session?.accessToken) {
      setError("Please login first.");
      setLoading(false);
      return;
    }
    apiJson<{ items: typeof bookings }>(
      "/rider/bookings",
      undefined,
      session.accessToken,
    )
      .then((res) => setBookings(res.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load trips"))
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  const completedCount = useMemo(
    () => bookings.filter((t) => t.status.toLowerCase().includes("completed")).length,
    [bookings],
  );

  async function cancelBooking(id: string) {
    if (!session?.accessToken) return;
    setCancelling(id);
    try {
      await apiJson(`/rider/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      }, session.accessToken);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">My Travel History</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Detailed ride records, bills, payments, subsidy details, and downloadable invoices.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Filter & Search</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="in-progress">In Progress</option>
          </Select>
          <Input placeholder="Search by trip ID / location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Showing {filteredBookings.length} of {bookings.length} bookings</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trips & Billing</h2>
        {loading ? <p className="mt-3 text-sm text-slate-600">Loading trips...</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Trip ID</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Route</th>
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2 pr-3">Distance</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((trip) => (
                <tr key={trip.id} className="border-b">
                  <td className="py-2 pr-3">{trip.trip_id ? `${String(trip.trip_id).slice(0, 8)}...` : String(trip.id).slice(0, 8)}</td>
                  <td className="py-2 pr-3">{new Date(trip.scheduled_at).toLocaleString()}</td>
                  <td className="py-2 pr-3">
                    {trip.pickup} to {trip.dropoff}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="text-slate-800">{trip.driver_name || trip.driver_email || "Unassigned"}</span>
                  </td>
                  <td className="py-2 pr-3">
                    {trip.pickup_lat != null && trip.pickup_lng != null && trip.dropoff_lat != null && trip.dropoff_lng != null
                      ? `${haversineKm(trip.pickup_lat, trip.pickup_lng, trip.dropoff_lat, trip.dropoff_lng).toFixed(1)} km`
                      : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge
                      tone={trip.status === "cancelled" ? "danger" : trip.status.toLowerCase().includes("completed") ? "certified" : "pending"}
                    >
                      {trip.trip_state || trip.status}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3">Card on file</td>
                  <td className="py-2 pr-3">-</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/rider/dashboard?rebook=${encodeURIComponent(trip.pickup)}&dropoff=${encodeURIComponent(trip.dropoff)}`}>
                        <Button variant="outline">Rebook</Button>
                      </Link>
                      {trip.status !== "cancelled" && !trip.status.toLowerCase().includes("completed") && (
                        <Button variant="danger" size="sm" disabled={cancelling === trip.id} onClick={() => cancelBooking(trip.id)}>
                          {cancelling === trip.id ? "..." : "Cancel"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Payment Summary</h3>
          <p className="mt-2 text-sm text-slate-700">Completed rides: {completedCount}</p>
          <p className="text-sm text-slate-700">Total bookings: {bookings.length}</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Outstanding Bills</h3>
          <p className="mt-2 text-sm text-slate-700">No pending bills.</p>
          <Button variant="outline" className="mt-3">
            Billing Center
          </Button>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--color-primary)]">Rewards</h3>
          <p className="mt-2 text-sm text-slate-700">
            Refer friends and get <strong>$20 off</strong> your next ride.
          </p>
          <Button className="mt-3">Invite & Earn</Button>
        </Card>
      </div>
    </div>
  );
}
