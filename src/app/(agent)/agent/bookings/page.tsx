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

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Booking[] }>("/partner/bookings", undefined, session.accessToken)
      .then((res) => setItems(res.items))
      .catch(() => undefined);
    apiJson<{ items: Rider[] }>("/partner/riders", undefined, session.accessToken)
      .then((res) => {
        setRiders(res.items);
        if (res.items[0]) setRiderId(res.items[0].id);
      })
      .catch(() => undefined);
  }, []);

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
      setItems((prev) => [res.booking, ...prev]);
      setMessage(`Booking created for rider.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to create booking");
    }
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
          <Button variant="outline">Save as Template</Button>
          <Button variant="outline">Duplicate for Return Trip</Button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Recent Partner Bookings</h2>
        <div className="mt-3 space-y-2 text-sm">
          {items.slice(0, 8).map((b) => (
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
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Book at Once</h2>
        <p className="mt-2 text-sm text-slate-700">
          Create batched bookings for a ward, wing, or therapy group in a single flow.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Start Multi-Client Batch Booking</Button>
          <Button variant="outline">Import Existing Weekly Plan</Button>
        </div>
      </Card>
    </div>
  );
}
