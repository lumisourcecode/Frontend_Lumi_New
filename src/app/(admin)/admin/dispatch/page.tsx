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
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState("");

  const session = getAuthSession();

  async function refreshBoard() {
    if (!session?.accessToken) return;
    const t = session.accessToken;
    await Promise.all([
      apiJson<{ items: typeof riders }>("/admin/riders", undefined, t).then((r) => setRiders(r.items)).catch(() => {}),
      apiJson<{ items: typeof drivers }>("/admin/drivers", undefined, t).then((r) => setDrivers(r.items)).catch(() => {}),
      apiJson<{ items: typeof bookings }>("/admin/bookings", undefined, t).then((r) => setBookings(r.items)).catch(() => {}),
      apiJson<{ items: typeof trips }>("/admin/trips", undefined, t).then((r) => setTrips(r.items)).catch(() => {}),
    ]);
  }

  useEffect(() => {
    refreshBoard().catch(() => undefined);
  }, [session?.accessToken]);

  const conflicts = useMemo(() => detectScheduleConflicts(bookingsSeed, timeOffSeed), []);
  const pendingTrips = trips.filter((t) => t.state === "pending_assignment" || !t.driver_id);
  const approvedDrivers = drivers.filter((d) => d.verification_status === "Approved");

  async function assignTrip(tripId: string, driverId: string) {
    if (!session?.accessToken) return;
    await apiJson(`/admin/trips/${tripId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ driverId }),
    }, session.accessToken);
  }

  async function runAutoAssign(limit = 10) {
    if (!session?.accessToken || approvedDrivers.length === 0 || pendingTrips.length === 0) {
      setMsg("No pending trips or no approved drivers available.");
      return;
    }
    setAssigning(true);
    setMsg("");
    try {
      const toAssign = pendingTrips.slice(0, limit);
      for (let i = 0; i < toAssign.length; i += 1) {
        const trip = toAssign[i];
        const driver = matchingMode === "roundRobin"
          ? approvedDrivers[i % approvedDrivers.length]
          : approvedDrivers[0];
        await assignTrip(trip.id, driver.id);
      }
      await refreshBoard();
      setMsg(`Auto-assigned ${Math.min(limit, toAssign.length)} pending trip(s) using ${matchingMode === "roundRobin" ? "round-robin" : "proximity-priority"} mode.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Auto-assignment failed");
    } finally {
      setAssigning(false);
    }
  }

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
          <Button
            className="mt-2"
            variant="outline"
            disabled={assigning || pendingTrips.length === 0 || approvedDrivers.length === 0}
            onClick={() => runAutoAssign(10)}
          >
            {assigning ? "Auto-assigning..." : "Auto Assign Pending Trips"}
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
                await refreshBoard();
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
                await assignTrip(assignTripId, assignDriverId);
                setMsg("Driver assigned.");
                setAssignTripId("");
                setAssignDriverId("");
                await refreshBoard();
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
                            await refreshBoard();
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
