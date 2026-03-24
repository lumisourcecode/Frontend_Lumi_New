"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlacesAutocomplete } from "@/components/map/places-autocomplete";
import { RoutePreview } from "@/components/map/route-preview";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { haversineKm } from "@/lib/distance";

type Booking = {
  id: string;
  rider_id?: string;
  pickup: string;
  dropoff: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  scheduled_at: string;
  status: string;
  rider_name?: string;
  rider_email?: string;
  trip_id?: string;
  trip_state?: string;
  driver_id?: string;
  driver_name?: string;
  driver_email?: string;
  mobility_needs?: string;
  notes?: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [riders, setRiders] = useState<Array<{ id: string; email: string; full_name?: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; email: string; full_name?: string; verification_status?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createRiderId, setCreateRiderId] = useState("");
  const [createPickup, setCreatePickup] = useState("");
  const [createDropoff, setCreateDropoff] = useState("");
  const [createPickupCoords, setCreatePickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [createDropoffCoords, setCreateDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [createScheduledAt, setCreateScheduledAt] = useState("");
  const [createDriverId, setCreateDriverId] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createMobility, setCreateMobility] = useState("Wheelchair-accessible");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [tripStateFilter, setTripStateFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [riderFilter, setRiderFilter] = useState("");

  const session = getAuthSession();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(searchQ), 400);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const bookingsPath = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (tripStateFilter !== "all") params.set("tripState", tripStateFilter);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    if (dateFrom) params.set("from", new Date(dateFrom).toISOString());
    if (dateTo) params.set("to", new Date(`${dateTo}T23:59:59.999`).toISOString());
    if (riderFilter) params.set("riderId", riderFilter);
    const qs = params.toString();
    return `/admin/bookings${qs ? `?${qs}` : ""}`;
  }, [filterStatus, tripStateFilter, debouncedQ, dateFrom, dateTo, riderFilter]);

  function refetch() {
    if (!session?.accessToken) return;
    setLoading(true);
    apiJson<{ items: Booking[] }>(bookingsPath, undefined, session.accessToken, { timeoutMs: 90_000 })
      .then((r) => setBookings(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!session?.accessToken) return;
    const t = session.accessToken;
    setLoading(true);
    apiJson<{ items: Booking[] }>(bookingsPath, undefined, t, { timeoutMs: 90_000 })
      .then((r) => setBookings(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
    apiJson<{ items: typeof riders }>("/admin/riders", undefined, t).then((r) => setRiders(r.items)).catch(() => {});
    apiJson<{ items: typeof drivers }>("/admin/drivers", undefined, t).then((r) => setDrivers(r.items)).catch(() => {});
  }, [session?.accessToken, bookingsPath]);

  async function createBooking() {
    if (!session?.accessToken || !createRiderId || !createPickup || !createDropoff || !createScheduledAt) {
      setMsg("Fill rider, pickup, dropoff, and date.");
      return;
    }
    setMsg("");
    try {
      await apiJson("/admin/bookings", {
        method: "POST",
        body: JSON.stringify({
          riderId: createRiderId,
          pickup: createPickup,
          dropoff: createDropoff,
          pickupLat: createPickupCoords?.lat,
          pickupLng: createPickupCoords?.lng,
          dropoffLat: createDropoffCoords?.lat,
          dropoffLng: createDropoffCoords?.lng,
          scheduledAt: new Date(createScheduledAt).toISOString(),
          driverId: createDriverId || undefined,
          mobilityNeeds: createMobility || undefined,
          notes: createNotes || undefined,
        }),
      }, session.accessToken);
      setMsg("Booking created.");
      setCreateRiderId("");
      setCreatePickup("");
      setCreateDropoff("");
      setCreateScheduledAt("");
      setCreateDriverId("");
      setCreateNotes("");
      setShowCreate(false);
      refetch();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  async function updateBookingStatus(id: string, status: string) {
    if (!session?.accessToken) return;
    setUpdating(id);
    try {
      await apiJson(`/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, session.accessToken);
      refetch();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = bookings.filter((b) => b.status !== "cancelled" && b.status !== "completed").length;

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Create, view, and manage all bookings. Cancel or update status as needed.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : bookings.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-700">{loading ? "—" : pendingCount}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">All Bookings</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              Refresh
            </Button>
            <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Hide" : "Create Booking"}</Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Input
            placeholder="Search route, rider email, name"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="min-w-0"
          />
          <Select value={riderFilter} onChange={(e) => setRiderFilter(e.target.value)}>
            <option value="">All riders</option>
            {riders.map((r) => (
              <option key={r.id} value={r.id}>{r.full_name || r.email}</option>
            ))}
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All booking statuses</option>
            <option value="pending_matching">Pending matching</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select value={tripStateFilter} onChange={(e) => setTripStateFilter(e.target.value)}>
            <option value="all">Any trip</option>
            <option value="unassigned">No trip row</option>
            <option value="pending_assignment">Trip: pending assignment</option>
            <option value="Assigned">Trip: assigned</option>
            <option value="Completed">Trip: completed</option>
            <option value="Cancelled">Trip: cancelled</option>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="Scheduled from" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="Scheduled to" />
        </div>
        {showCreate ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium text-slate-800">New Booking</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Select value={createRiderId} onChange={(e) => setCreateRiderId(e.target.value)}>
                <option value="">Select rider</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>{r.full_name || r.email}</option>
                ))}
              </Select>
              <div>
                <label className="mb-1 block text-sm font-medium">Pickup</label>
                <PlacesAutocomplete
                  value={createPickup}
                  onChange={(v, place) => {
                    setCreatePickup(v);
                    setCreatePickupCoords(place?.lat != null && place?.lng != null ? { lat: place.lat, lng: place.lng } : null);
                  }}
                  placeholder="Pickup in Australia"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Drop-off</label>
                <PlacesAutocomplete
                  value={createDropoff}
                  onChange={(v, place) => {
                    setCreateDropoff(v);
                    setCreateDropoffCoords(place?.lat != null && place?.lng != null ? { lat: place.lat, lng: place.lng } : null);
                  }}
                  placeholder="Destination in Australia"
                />
              </div>
              <div className="md:col-span-2">
                <RoutePreview origin={createPickupCoords} destination={createDropoffCoords} />
              </div>
              <Input type="datetime-local" value={createScheduledAt} onChange={(e) => setCreateScheduledAt(e.target.value)} />
              <Select value={createDriverId} onChange={(e) => setCreateDriverId(e.target.value)}>
                <option value="">No driver (pending)</option>
                {drivers.filter((d) => d.verification_status === "Approved").map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
                ))}
              </Select>
              <Select value={createMobility} onChange={(e) => setCreateMobility(e.target.value)}>
                <option>Wheelchair-accessible</option>
                <option>Door-to-door assistance</option>
                <option>Companion required</option>
                <option>Service Animal</option>
              </Select>
              <Textarea placeholder="Notes" value={createNotes} onChange={(e) => setCreateNotes(e.target.value)} className="md:col-span-2" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={createBooking}>Create</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
            {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
          </div>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">Showing {bookings.length} bookings (server-filtered)</p>
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No bookings match filters. Adjust filters or create a booking.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Distance</th>
                  <th className="py-2 pr-3">Support</th>
                  <th className="py-2 pr-3">Scheduled</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 pr-3">
                      {b.rider_id ? (
                        <Link href={`/admin/users/${b.rider_id}`} className="font-medium text-[var(--color-primary)] hover:underline">
                          {b.rider_name || b.rider_email || b.id}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-900">{b.rider_name || b.rider_email || b.id}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs">{b.pickup} → {b.dropoff}</td>
                    <td className="py-2 pr-3 text-xs">
                      {b.pickup_lat != null && b.pickup_lng != null && b.dropoff_lat != null && b.dropoff_lng != null
                        ? `${haversineKm(b.pickup_lat, b.pickup_lng, b.dropoff_lat, b.dropoff_lng).toFixed(1)} km`
                        : "—"}
                    </td>
                    <td className="py-2 pr-3 text-xs">{b.mobility_needs || "—"}</td>
                    <td className="py-2 pr-3">{new Date(b.scheduled_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={b.status === "cancelled" ? "danger" : b.status === "completed" ? "certified" : "pending"}>{b.status}</Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        {b.trip_id && (
                          <Link href={`/admin/trips-history?trip=${b.trip_id}`}>
                            <Button variant="outline" size="sm">Open trip</Button>
                          </Link>
                        )}
                        {b.driver_id && (
                          <Link href={`/admin/users/${b.driver_id}`}>
                            <Button variant="outline" size="sm">{b.driver_name || b.driver_email || "Driver"}</Button>
                          </Link>
                        )}
                        {b.status !== "cancelled" && b.status !== "completed" && (
                          <Select
                            value=""
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v) updateBookingStatus(b.id, v);
                            }}
                            disabled={updating === b.id}
                          >
                            <option value="">Update status</option>
                            <option value="confirmed">Confirm</option>
                            <option value="pending_matching">Pending</option>
                            <option value="cancelled">Cancel</option>
                          </Select>
                        )}
                      </div>
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
