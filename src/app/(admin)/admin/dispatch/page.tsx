"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detectScheduleConflicts,
  optimizeTours,
  parseMemberHotlistCsv,
  type BookingSlot,
  type TimeOffSlot,
} from "@/lib/automation";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

const bookingsSeed: BookingSlot[] = [];
const timeOffSeed: TimeOffSlot[] = [];
const sampleHotlist = `card_number,status
7788112233,suspended
1234567890,active`;

export default function AdminDispatchPage() {
  const [matchingMode, setMatchingMode] = useState<"proximity" | "roundRobin">("proximity");
  const [optimized, setOptimized] = useState<string[]>([]);
  const [blockedCards, setBlockedCards] = useState<Set<string>>(new Set());
  const [bookingAdded, setBookingAdded] = useState(false);
  const [riders, setRiders] = useState<Array<{ id: string; email: string; full_name: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; email: string; full_name: string; verification_status: string }>>([]);
  const [bookings, setBookings] = useState<Array<{ id: string; pickup: string; dropoff: string; status: string; rider_name: string; trip_id: string; trip_state: string; driver_id: string }>>([]);
  const [trips, setTrips] = useState<Array<{ id: string; state: string; pickup: string; dropoff: string; rider_name: string; driver_name: string; driver_id: string }>>([]);
  const [manualRiderId, setManualRiderId] = useState("");
  const [manualPickup, setManualPickup] = useState("");
  const [manualDropoff, setManualDropoff] = useState("");
  const [manualScheduledAt, setManualScheduledAt] = useState("");
  const [manualDriverId, setManualDriverId] = useState("");
  const [assignTripId, setAssignTripId] = useState("");
  const [assignDriverId, setAssignDriverId] = useState("");
  const [msg, setMsg] = useState("");

  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    const t = session.accessToken;
    apiJson<{ items: typeof riders }>("/admin/riders", undefined, t).then((r) => setRiders(r.items)).catch(() => {});
    apiJson<{ items: typeof drivers }>("/admin/drivers", undefined, t).then((r) => setDrivers(r.items)).catch(() => {});
    apiJson<{ items: typeof bookings }>("/admin/bookings", undefined, t).then((r) => setBookings(r.items)).catch(() => {});
    apiJson<{ items: typeof trips }>("/admin/trips", undefined, t).then((r) => setTrips(r.items)).catch(() => {});
  }, [session?.accessToken]);

  const conflicts = useMemo(() => detectScheduleConflicts(bookingsSeed, timeOffSeed), []);
  const pendingTrips = trips.filter((t) => t.state === "pending_assignment" || !t.driver_id);

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Admin Command Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Real-time dispatch, operations, compliance, and manual intervention tools.
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--color-primary)]">Global Dispatch Map</h2>
        <div className="mt-3 h-72 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
          Realtime map placeholder for active drivers and pending pickup requests.
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Automation Controls</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={matchingMode === "proximity" ? "primary" : "outline"}
              onClick={() => setMatchingMode("proximity")}
            >
              Proximity Matching
            </Button>
            <Button
              variant={matchingMode === "roundRobin" ? "primary" : "outline"}
              onClick={() => setMatchingMode("roundRobin")}
            >
              Round Robin Fairness
            </Button>
          </div>
          <Button
            className="mt-3"
            onClick={() => {
              const tours = optimizeTours(
                [
                  { id: "DRV-1", lat: -37.81, lng: 144.96 },
                  { id: "DRV-2", lat: -37.78, lng: 144.99 },
                ],
                [
                  { id: "PK-1", lat: -37.82, lng: 144.95, riderName: "Riley Green" },
                  { id: "PK-2", lat: -37.79, lng: 144.98, riderName: "Sam Lee" },
                ],
              );
              setOptimized(tours.map((t) => `${t.riderName} -> ${t.assignedDriverId}`));
            }}
          >
            Optimize Tours
          </Button>
          {optimized.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-emerald-700">
              {optimized.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Compliance Hub</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline">Export NDIS Bulk Claim CSV</Button>
            <Button variant="outline">Export MPTP DCP Trip Files</Button>
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              setBlockedCards(parseMemberHotlistCsv(sampleHotlist));
            }}
          >
            Import Member Hotlist CSV
          </Button>
          {blockedCards.size > 0 ? (
            <p className="mt-2 text-xs text-red-700">Blocked card count: {blockedCards.size}</p>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Smart Conflict Detection</h2>
          <div className="mt-3 space-y-2">
            {conflicts.map((conflict) => (
              <div key={conflict.bookingId} className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
                <Badge tone="danger">Red Alert</Badge>
                <p className="mt-1">{conflict.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Manual Add Booking</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select value={manualRiderId} onChange={(e) => setManualRiderId(e.target.value)}>
              <option value="">Select rider</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name || r.email}</option>
              ))}
            </Select>
            <Input placeholder="Pickup" value={manualPickup} onChange={(e) => setManualPickup(e.target.value)} className="md:col-span-2" />
            <Input placeholder="Drop-off" value={manualDropoff} onChange={(e) => setManualDropoff(e.target.value)} className="md:col-span-2" />
            <Input type="datetime-local" value={manualScheduledAt} onChange={(e) => setManualScheduledAt(e.target.value)} />
            <Select value={manualDriverId} onChange={(e) => setManualDriverId(e.target.value)}>
              <option value="">No driver (pending)</option>
              {drivers.filter((d) => d.verification_status === "Approved").map((d) => (
                <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
              ))}
            </Select>
          </div>
          <Button
            className="mt-3"
            onClick={async () => {
              if (!session?.accessToken || !manualRiderId || !manualPickup || !manualDropoff || !manualScheduledAt) {
                setMsg("Fill rider, pickup, dropoff, date.");
                return;
              }
              try {
                await apiJson("/admin/bookings", {
                  method: "POST",
                  body: JSON.stringify({
                    riderId: manualRiderId,
                    pickup: manualPickup,
                    dropoff: manualDropoff,
                    scheduledAt: new Date(manualScheduledAt).toISOString(),
                    driverId: manualDriverId || undefined,
                  }),
                }, session.accessToken);
                setBookingAdded(true);
                setMsg("Booking created.");
                setManualRiderId("");
                setManualPickup("");
                setManualDropoff("");
                setManualScheduledAt("");
                setManualDriverId("");
                apiJson<{ items: typeof bookings }>("/admin/bookings", undefined, session.accessToken).then((r) => setBookings(r.items));
                apiJson<{ items: typeof trips }>("/admin/trips", undefined, session.accessToken).then((r) => setTrips(r.items));
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Failed");
              }
            }}
          >
            Create Manual Booking
          </Button>
          {msg ? <p className="mt-2 text-xs text-slate-600">{msg}</p> : null}
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Assign Driver to Trip</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select value={assignTripId} onChange={(e) => setAssignTripId(e.target.value)}>
              <option value="">Select trip</option>
              {pendingTrips.map((t) => (
                <option key={t.id} value={t.id}>{t.pickup} → {t.dropoff} ({t.rider_name})</option>
              ))}
            </Select>
            <Select value={assignDriverId} onChange={(e) => setAssignDriverId(e.target.value)}>
              <option value="">Select driver</option>
              {drivers.filter((d) => d.verification_status === "Approved").map((d) => (
                <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
              ))}
            </Select>
          </div>
          <Button
            className="mt-3"
            disabled={!assignTripId || !assignDriverId}
            onClick={async () => {
              if (!session?.accessToken || !assignTripId || !assignDriverId) return;
              try {
                await apiJson(`/admin/trips/${assignTripId}/assign`, {
                  method: "PATCH",
                  body: JSON.stringify({ driverId: assignDriverId }),
                }, session.accessToken);
                setMsg("Driver assigned.");
                setAssignTripId("");
                setAssignDriverId("");
                apiJson<{ items: typeof trips }>("/admin/trips", undefined, session.accessToken).then((r) => setTrips(r.items));
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Failed");
              }
            }}
          >
            Assign Driver
          </Button>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--color-primary)]">Recent Bookings & Trips</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Rider</th>
                <th className="py-2 pr-3">Route</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 20).map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-2 pr-3">{b.rider_name || b.id}</td>
                  <td className="py-2 pr-3">{b.pickup} → {b.dropoff}</td>
                  <td className="py-2 pr-3"><Badge tone={b.status === "pending_matching" ? "pending" : b.status === "cancelled" ? "danger" : "certified"}>{b.status}</Badge></td>
                  <td className="py-2 pr-3">{b.driver_id ? drivers.find((d) => d.id === b.driver_id)?.full_name || "Assigned" : "Unassigned"}</td>
                  <td className="py-2">
                    {b.status !== "cancelled" && b.status !== "completed" && session?.accessToken && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          try {
                            await apiJson(`/admin/bookings/${b.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: "cancelled" }),
                            }, session.accessToken);
                            apiJson<{ items: typeof bookings }>("/admin/bookings", undefined, session.accessToken).then((r) => setBookings(r.items));
                            apiJson<{ items: typeof trips }>("/admin/trips", undefined, session.accessToken).then((r) => setTrips(r.items));
                          } catch {}
                        }}
                      >
                        Cancel
                      </Button>
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
