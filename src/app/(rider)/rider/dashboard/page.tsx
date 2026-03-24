"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Accessibility, CarFront, Dog, LocateFixed, MapPin, Route } from "lucide-react";
import { applyMptpFareRules } from "@/lib/mptp";
import { PlacesAutocomplete } from "@/components/map/places-autocomplete";
import { RoutePreview } from "@/components/map/route-preview";
import { Badge, Button, Card, Input, Progress, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

function RiderDashboardContent() {
  const searchParams = useSearchParams();
  const rebookPickup = searchParams.get("rebook");
  const rebookDropoff = searchParams.get("dropoff");
  const [step, setStep] = useState(1);
  const [baseFare, setBaseFare] = useState(75);
  const [recentBookings, setRecentBookings] = useState<Array<{ id: string; pickup: string; dropoff: string; status: string }>>([]);
  const [mptpEligible, setMptpEligible] = useState(true);
  const [pickup, setPickup] = useState(rebookPickup ?? "");
  const [dropoff, setDropoff] = useState(rebookDropoff ?? "");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [mobilityNeeds, setMobilityNeeds] = useState("Wheelchair-accessible");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [tripNotifs, setTripNotifs] = useState<Array<{ id: string; type: string; payload: Record<string, unknown>; created_at: string }>>([]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Array<{ id: string; pickup: string; dropoff: string; status: string }> }>("/rider/bookings", undefined, session.accessToken)
      .then((r) => setRecentBookings(r.items.slice(0, 5)))
      .catch(() => {});
    apiJson<{ items: Array<{ id: string; type: string; payload: Record<string, unknown>; created_at: string }> }>(
      "/rider/notifications",
      undefined,
      session.accessToken,
    )
      .then((r) =>
        setTripNotifs(
          (r.items || []).filter((n) => String(n.type).startsWith("trip_") || n.type === "new_ride_request"),
        ),
      )
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (rebookPickup) setPickup(rebookPickup);
    if (rebookDropoff) setDropoff(rebookDropoff);
  }, [rebookPickup, rebookDropoff]);

  const pricing = useMemo(
    () => applyMptpFareRules({ baseFare, cardEligible: mptpEligible }),
    [baseFare, mptpEligible],
  );

  async function useMyLocationAsPickup() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationMsg("Location is not available on this device/browser.");
      return;
    }
    setLocating(true);
    setLocationMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPickupCoords({ lat, lng });
        setPickup("Current location");
        setLocating(false);
        // Optional: try to reverse-geocode to a human label if Maps is loaded
        try {
          if (typeof google !== "undefined" && google?.maps?.Geocoder) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results?.[0]?.formatted_address) {
                setPickup(results[0].formatted_address);
              }
            });
          }
        } catch {
          // ignore
        }
      },
      (err) => {
        setLocating(false);
        setLocationMsg(err?.message || "Failed to get location. Allow location permission in browser.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function applyRecentBooking(b: { pickup: string; dropoff: string }) {
    setPickup(b.pickup);
    setDropoff(b.dropoff);
    setPickupCoords(null);
    setDropoffCoords(null);
    setStep(1);
    setLocationMsg("");
  }

  async function createBooking() {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setMsg("Please login first.");
      return;
    }
    if (!pickup || !dropoff || !scheduledAt) {
      setMsg("Fill pickup, dropoff, and date/time.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const dt = new Date(scheduledAt);
      const res = await apiJson<{ booking: { id: string } }>(
        "/rider/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            pickup,
            dropoff,
            pickupLat: pickupCoords?.lat,
            pickupLng: pickupCoords?.lng,
            dropoffLat: dropoffCoords?.lat,
            dropoffLng: dropoffCoords?.lng,
            scheduledAt: dt.toISOString(),
            mobilityNeeds,
          }),
        },
        session.accessToken,
      );
      setMsg(`Booking created: ${res.booking.id}. Drivers will be notified.`);
      setStep(1);
      setPickup("");
      setDropoff("");
      setScheduledAt("");
      apiJson<{ items: Array<{ id: string; pickup: string; dropoff: string; status: string }> }>("/rider/bookings", undefined, session.accessToken)
        .then((r) => setRecentBookings(r.items.slice(0, 5)))
        .catch(() => {});
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[var(--color-primary-3)] text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Book a Ride</h2>
            <p className="mt-1 text-sm text-white/80">Fast accessible bookings with live route preview and partner support.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
            <p className="text-xs text-white/70">Your activity</p>
            <p className="mt-1 font-semibold">{recentBookings.length} recent booking(s)</p>
            <div className="mt-2">
              <Progress value={Math.min(100, recentBookings.length * 20)} />
            </div>
          </div>
        </div>
      </Card>

      {tripNotifs.length > 0 ? (
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">Trip updates</h3>
          <p className="mt-1 text-xs text-slate-500">Live steps from your driver (arrived, on board, completed).</p>
          <ul className="mt-2 space-y-2 text-sm">
            {tripNotifs.slice(0, 8).map((n) => {
              const p = n.payload as { title?: string; message?: string; tripId?: string };
              return (
                <li key={n.id} className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                  <span className="font-medium text-slate-800">{p.title || n.type}</span>
                  {p.message ? <p className="text-xs text-slate-600">{p.message}</p> : null}
                  <p className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-primary)]">Booking Wizard</h2>
              <p className="mt-1 text-sm text-slate-600">Step {step} of 3</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={useMyLocationAsPickup} disabled={locating}>
                <LocateFixed className="mr-2 size-4" />
                {locating ? "Locating..." : "Use my location"}
              </Button>
              <Link href="/rider/history">
                <Button variant="outline">History</Button>
              </Link>
            </div>
          </div>
          {locationMsg ? <p className="mt-2 text-sm text-slate-600">{locationMsg}</p> : null}

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Pickup</label>
              <PlacesAutocomplete
                value={pickup}
                onChange={(v, place) => {
                  setPickup(v);
                  setPickupCoords(place?.lat != null && place?.lng != null ? { lat: place.lat, lng: place.lng } : null);
                }}
                placeholder="Enter pickup in Australia"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Drop-off</label>
              <PlacesAutocomplete
                value={dropoff}
                onChange={(v, place) => {
                  setDropoff(v);
                  setDropoffCoords(place?.lat != null && place?.lng != null ? { lat: place.lat, lng: place.lng } : null);
                }}
                placeholder="Enter destination in Australia"
              />
            </div>
            <div className="md:col-span-2">
              <RoutePreview origin={pickupCoords} destination={dropoffCoords} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Date & time</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="default">
                <Accessibility className="mr-1 size-3" /> Wheelchair
              </Badge>
              <Badge tone="default">
                <Dog className="mr-1 size-3" /> Service Animal
              </Badge>
            </div>
            <Select value={mobilityNeeds} onChange={(e) => setMobilityNeeds(e.target.value)}>
              <option>Wheelchair-accessible</option>
              <option>Service Animal</option>
              <option>Door-to-Door Assistance</option>
            </Select>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            <Input
              type="number"
              value={baseFare}
              onChange={(event) => setBaseFare(Number(event.target.value))}
              placeholder="Base fare"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mptpEligible}
                onChange={(event) => setMptpEligible(event.target.checked)}
                className="size-4"
              />
              Eligible MPTP card holder
            </label>
            <Card className="bg-slate-50">
              <p className="text-sm">Subsidy Applied: ${pricing.subsidy}</p>
              <p className="text-sm font-semibold">Rider Pays: ${pricing.riderPayable}</p>
            </Card>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next
              <Route className="ml-2 size-4" />
            </Button>
          ) : (
            <Button onClick={createBooking} disabled={loading}>{loading ? "Creating..." : "Create Booking"}</Button>
          )}
        </div>
        {msg ? <p className="mt-3 text-sm text-slate-600">{msg}</p> : null}
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">Recent bookings</h3>
            <p className="mt-1 text-xs text-slate-500">Tap one to prefill pickup & drop-off.</p>
            <div className="mt-3 space-y-2">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-slate-600">No bookings yet.</p>
              ) : (
                recentBookings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => applyRecentBooking(b)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{b.pickup}</p>
                        <p className="mt-1 truncate text-xs text-slate-600">{b.dropoff}</p>
                      </div>
                      <Badge tone={b.status === "cancelled" ? "danger" : b.status.toLowerCase().includes("completed") ? "certified" : "pending"}>
                        {b.status}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/rider/history">
                <Button variant="outline">View full history</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">Quick locations</h3>
            <p className="mt-1 text-xs text-slate-500">One-tap fills to speed up booking.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setDropoff("Monash Medical Centre")}>
                <MapPin className="mr-2 size-4" />
                Monash Medical Centre
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDropoff("Royal Melbourne Hospital")}>
                <MapPin className="mr-2 size-4" />
                Royal Melbourne Hospital
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDropoff("Dialysis Clinic")}>
                <MapPin className="mr-2 size-4" />
                Dialysis Clinic
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">Live map</h3>
            <div className="mt-3">
              <RoutePreview origin={pickupCoords} destination={dropoffCoords} />
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <CarFront className="size-4 text-[var(--color-primary)]" />
                Route preview updates as you select locations.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RiderDashboardPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
      <RiderDashboardContent />
    </Suspense>
  );
}
