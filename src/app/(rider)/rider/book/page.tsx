"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type NearbyDriver = {
  id: string;
  full_name?: string;
  vehicle_rego?: string;
  eta_min?: number;
  distance_km?: number;
};

export default function RiderBookPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setNearbyLoading(false);
      return;
    }
    const token = session.accessToken;
    let cancelled = false;
    async function loadNearby() {
      try {
        const direct = await apiJson<{ items: NearbyDriver[] }>("/rider/nearby-drivers", undefined, token);
        if (!cancelled) setNearbyDrivers(direct.items ?? []);
      } catch {
        // Backward-compatible fallback for environments without dedicated nearby endpoint.
        try {
          const bookings = await apiJson<{
            items: Array<{
              driver_id?: string;
              driver_name?: string;
              distance_km?: number;
              eta_min?: number;
            }>;
          }>("/rider/bookings", undefined, token);
          if (!cancelled) {
            const mapped = (bookings.items ?? [])
              .filter((b) => b.driver_id || b.driver_name)
              .slice(0, 5)
              .map((b, idx) => ({
                id: b.driver_id || `driver-${idx}`,
                full_name: b.driver_name || "Assigned Driver",
                distance_km: b.distance_km,
                eta_min: b.eta_min,
              }));
            setNearbyDrivers(mapped);
          }
        } catch {
          if (!cancelled) setNearbyDrivers([]);
        }
      } finally {
        if (!cancelled) setNearbyLoading(false);
      }
    }
    loadNearby();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createQuickBooking() {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setMessage("Please login first to create a booking.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const res = await apiJson<{ booking: { id: string } }>(
        "/rider/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            pickup: "Home",
            dropoff: "Medical Centre",
            scheduledAt,
          }),
        },
        session.accessToken,
      );
      setMessage(`Quick booking created: ${res.booking.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Book a Ride</h1>
        <p className="mt-2 text-sm text-slate-700">
          Use the premium booking flow with login options, card payment setup, and instant
          notifications.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/book-my-ride">
            <Button>Open Booking Portal</Button>
          </Link>
          <Button variant="outline" onClick={createQuickBooking} disabled={loading}>
            {loading ? "Creating..." : "Quick Test Booking"}
          </Button>
          <Link href="/rider/history">
            <Button variant="outline">View My History</Button>
          </Link>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Nearby Drivers Who Can Accept</h2>
        {nearbyLoading ? <p className="mt-2 text-sm text-slate-500">Loading nearby drivers...</p> : null}
        {!nearbyLoading && nearbyDrivers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No nearby drivers available yet. Try booking now and we will match instantly when someone is close.</p>
        ) : null}
        <div className="mt-3 space-y-2">
          {nearbyDrivers.map((driver) => (
            <div key={driver.id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-900">{driver.full_name || "Available driver"}</p>
              <p className="text-slate-600">
                {driver.vehicle_rego ? `Vehicle ${driver.vehicle_rego}` : "Verified partner driver"}
                {typeof driver.distance_km === "number" ? ` • ${driver.distance_km.toFixed(1)} km away` : ""}
                {typeof driver.eta_min === "number" ? ` • ETA ${driver.eta_min} min` : ""}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
