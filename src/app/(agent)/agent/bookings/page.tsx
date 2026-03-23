"use client";

import { useEffect, useState } from "react";
import { PlacesAutocomplete } from "@/components/map/places-autocomplete";
import { RoutePreview } from "@/components/map/route-preview";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { haversineKm } from "@/lib/distance";

type Rider = { id: string; email: string; full_name?: string };
type Booking = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  status: string;
  trip_state?: string;
  driver_name?: string;
  driver_email?: string;
  mobility_needs?: string;
  notes?: string;
};

export default function PartnerBookingsPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [riderId, setRiderId] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [when, setWhen] = useState("");
  const [mobilityNeeds, setMobilityNeeds] = useState("Wheelchair-accessible");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);

  async function loadBookings(nextPage = page) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
        sort,
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const res = await apiJson<{ items: Booking[]; total?: number; page?: number; limit?: number }>(
        `/partner/bookings?${params.toString()}`,
        undefined,
        session.accessToken,
      );
      setItems(res.items ?? []);
      setTotal(Number(res.total ?? res.items?.length ?? 0));
      setPage(Number(res.page ?? nextPage));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    loadBookings(1).catch(() => undefined);
    apiJson<{ items: Rider[] }>("/partner/riders", undefined, session.accessToken)
      .then((res) => {
        setRiders(res.items);
        if (res.items[0]) setRiderId(res.items[0].id);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadBookings(1).catch(() => undefined);
    // refresh when server-driven query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sort, limit]);

  async function createPartnerBooking() {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setMessage("Please login as partner first.");
      return;
    }
    if (!riderId) {
      setMessage("Select a rider first. Register riders from the rider portal.");
      return;
    }
    try {
      const res = await apiJson<{ booking: Booking }>(
        "/partner/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            riderId,
            pickup: pickup || "Facility Pickup",
            dropoff: dropoff || "Clinic Dropoff",
            pickupLat: pickupCoords?.lat,
            pickupLng: pickupCoords?.lng,
            dropoffLat: dropoffCoords?.lat,
            dropoffLng: dropoffCoords?.lng,
            scheduledAt: when || new Date(Date.now() + 3600000).toISOString(),
            mobilityNeeds,
            notes,
          }),
        },
        session.accessToken,
      );
      await loadBookings(1);
      setMessage(`Booking created for rider.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to create booking");
    }
  }

  function saveAsTemplate() {
    if (typeof window === "undefined") return;
    const payload = { riderId, pickup, dropoff, when, mobilityNeeds, notes };
    window.localStorage.setItem("partner_booking_template_v1", JSON.stringify(payload));
    setMessage("Booking template saved locally. You can reuse this draft in this browser.");
  }

  function duplicateForReturnTrip() {
    const oldPickup = pickup;
    const oldDropoff = dropoff;
    const oldPickupCoords = pickupCoords;
    const oldDropoffCoords = dropoffCoords;
    setPickup(oldDropoff);
    setDropoff(oldPickup);
    setPickupCoords(oldDropoffCoords);
    setDropoffCoords(oldPickupCoords);
    setMessage("Route duplicated for return trip. Review date/time and create booking.");
  }

  function startBatchBooking() {
    setMessage("Batch booking API is not available yet. Use quick repeated manual booking for now.");
  }

  function importWeeklyPlan() {
    setMessage("Weekly plan import endpoint is not available yet. Create plan in Partner Plans and book from there.");
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#17206D] to-[#2790BE] text-white">
        <h1 className="text-2xl font-bold">Book on Behalf of Clients</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Create individual or group bookings for residents/patients with support preferences.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Manual Client Booking</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Select value={riderId} onChange={(e) => setRiderId(e.target.value)}>
            <option value="">Select rider...</option>
            {riders.map((r) => (
              <option key={r.id} value={r.id}>{r.full_name || r.email}</option>
            ))}
          </Select>
          <Select>
            <option>Facility: Lakeside Nursing Home</option>
            <option>Facility: Sunrise Disability Hub</option>
          </Select>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Pickup</label>
            <PlacesAutocomplete
              value={pickup}
              onChange={(v, place) => {
                setPickup(v);
                setPickupCoords(place?.lat != null && place?.lng != null ? { lat: place.lat, lng: place.lng } : null);
              }}
              placeholder="Pickup address in Australia"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Drop-off</label>
            <PlacesAutocomplete
              value={dropoff}
              onChange={(v, place) => {
                setDropoff(v);
                setDropoffCoords(place?.lat != null && place?.lng != null ? { lat: place.lat, lng: place.lng } : null);
              }}
              placeholder="Destination in Australia"
            />
          </div>
          <div className="md:col-span-3">
            <RoutePreview origin={pickupCoords} destination={dropoffCoords} />
          </div>
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          <Select value={mobilityNeeds} onChange={(e) => setMobilityNeeds(e.target.value)}>
            <option>Wheelchair-accessible</option>
            <option>Door-to-door assistance</option>
            <option>Companion required</option>
            <option>Service Animal</option>
          </Select>
          <Textarea className="md:col-span-2" placeholder="Care instructions for driver" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={createPartnerBooking}>Create Booking</Button>
          <Button variant="outline" onClick={saveAsTemplate}>Save as Template</Button>
          <Button variant="outline" onClick={duplicateForReturnTrip}>Duplicate for Return Trip</Button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Recent Partner Bookings</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Input placeholder="Search route/client" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="pending_matching">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="scheduled_desc">Scheduled latest</option>
            <option value="scheduled_asc">Scheduled earliest</option>
          </Select>
          <Select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="8">8 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </Select>
          <Button variant="outline" onClick={() => loadBookings(1).catch(() => undefined)}>Search</Button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {loading ? <p className="text-slate-500">Loading...</p> : null}
          {items.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-medium text-[var(--color-primary)]">{String(b.id).slice(0, 8)}...</p>
              <p className="text-slate-600">{b.pickup} → {b.dropoff}</p>
              <p className="mt-1 text-xs text-slate-500">
                Driver: <strong>{b.driver_name || b.driver_email || "Unassigned"}</strong>
                {" • "}
                Distance:{" "}
                {b.pickup_lat != null && b.pickup_lng != null && b.dropoff_lat != null && b.dropoff_lng != null
                  ? `${haversineKm(b.pickup_lat, b.pickup_lng, b.dropoff_lat, b.dropoff_lng).toFixed(1)} km`
                  : "—"}
              </p>
              {b.mobility_needs && <p className="text-xs text-slate-500">Support: {b.mobility_needs}</p>}
              <p className="text-xs text-slate-500">Status: {b.trip_state || b.status}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {items.length} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1 || loading} onClick={() => loadBookings(page - 1).catch(() => undefined)}>Prev</Button>
            <Button variant="outline" disabled={page * limit >= total || loading} onClick={() => loadBookings(page + 1).catch(() => undefined)}>Next</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Book at Once</h2>
        <p className="mt-2 text-sm text-slate-700">
          Create batched bookings for a ward, wing, or therapy group in a single flow.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={startBatchBooking}>Start Multi-Client Batch Booking</Button>
          <Button variant="outline" onClick={importWeeklyPlan}>Import Existing Weekly Plan</Button>
        </div>
      </Card>
    </div>
  );
}
