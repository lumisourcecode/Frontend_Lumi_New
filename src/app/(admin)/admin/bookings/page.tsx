"use client";

import { useEffect, useState } from "react";
import { PlacesAutocomplete } from "@/components/map/places-autocomplete";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Booking = {
  id: string;
  pickup: string;
  dropoff: string;
  scheduled_at: string;
  status: string;
  rider_name?: string;
  rider_email?: string;
  trip_id?: string;
  trip_state?: string;
  driver_id?: string;
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
  const [createScheduledAt, setCreateScheduledAt] = useState("");
  const [createDriverId, setCreateDriverId] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createMobility, setCreateMobility] = useState("Wheelchair-accessible");
  const [updating, setUpdating] = useState<string | null>(null);

  const session = getAuthSession();

  function refetch() {
    if (!session?.accessToken) return;
    apiJson<{ items: Booking[] }>("/admin/bookings", undefined, session.accessToken)
      .then((r) => setBookings(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!session?.accessToken) return;
    const t = session.accessToken;
    apiJson<{ items: Booking[] }>("/admin/bookings", undefined, t).then((r) => setBookings(r.items)).catch(() => {}).finally(() => setLoading(false));
    apiJson<{ items: typeof riders }>("/admin/riders", undefined, t).then((r) => setRiders(r.items)).catch(() => {});
    apiJson<{ items: typeof drivers }>("/admin/drivers", undefined, t).then((r) => setDrivers(r.items)).catch(() => {});
  }, [session?.accessToken]);

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">All Bookings</h2>
          <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Hide" : "Create Booking"}</Button>
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
                <PlacesAutocomplete value={createPickup} onChange={(v) => setCreatePickup(v)} placeholder="Pickup in Australia" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Drop-off</label>
                <PlacesAutocomplete value={createDropoff} onChange={(v) => setCreateDropoff(v)} placeholder="Destination in Australia" />
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
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No bookings yet. Create one above or from Dispatch.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Support</th>
                  <th className="py-2 pr-3">Scheduled</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">{b.rider_name || b.rider_email || b.id}</td>
                    <td className="py-2 pr-3 text-xs">{b.pickup} → {b.dropoff}</td>
                    <td className="py-2 pr-3 text-xs">{b.mobility_needs || "—"}</td>
                    <td className="py-2 pr-3">{new Date(b.scheduled_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={b.status === "cancelled" ? "danger" : b.status === "completed" ? "certified" : "pending"}>{b.status}</Badge>
                    </td>
                    <td className="py-2">
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <div className="flex gap-2">
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
                        </div>
                      )}
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
