"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Accessibility, CarFront, Dog } from "lucide-react";
import { applyMptpFareRules } from "@/lib/mptp";
import { PlacesAutocomplete } from "@/components/map/places-autocomplete";
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
  const [scheduledAt, setScheduledAt] = useState("");
  const [mobilityNeeds, setMobilityNeeds] = useState("Wheelchair-accessible");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Array<{ id: string; pickup: string; dropoff: string; status: string }> }>("/rider/bookings", undefined, session.accessToken)
      .then((r) => setRecentBookings(r.items.slice(0, 5)))
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
      <Card className="bg-[var(--color-primary)] text-white">
        <h2 className="text-xl font-bold">My Bookings</h2>
        <p className="mt-1 text-sm text-indigo-100">{recentBookings.length} recent booking(s). Create new below.</p>
        <div className="mt-3">
          <Progress value={Math.min(100, recentBookings.length * 20)} />
        </div>
      </Card>

      {recentBookings.length > 0 ? (
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Recent Bookings</h3>
          <div className="mt-3 space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                <span>{b.pickup} → {b.dropoff}</span>
                <Badge tone={b.status === "cancelled" ? "danger" : b.status.toLowerCase().includes("completed") ? "certified" : "pending"}>{b.status}</Badge>
                <Link href="/rider/history">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-lg font-bold text-[var(--color-primary)]">Booking Wizard</h2>
        <p className="mb-4 text-sm text-slate-600">Step {step} of 3</p>

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Pickup</label>
              <PlacesAutocomplete value={pickup} onChange={(v) => setPickup(v)} placeholder="Enter pickup in Australia" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Drop-off</label>
              <PlacesAutocomplete value={dropoff} onChange={(v) => setDropoff(v)} placeholder="Enter destination in Australia" />
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
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={createBooking} disabled={loading}>{loading ? "Creating..." : "Create Booking"}</Button>
          )}
        </div>
        {msg ? <p className="mt-3 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--color-primary)]">Live Map</h3>
        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <CarFront className="size-4 text-[var(--color-primary)]" />
            Driver is moving toward pickup location (placeholder map stream).
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--color-primary)]">My Account Shortcuts</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/rider/history">
            <Button>Travel History & Bills</Button>
          </Link>
          <Link href="/rider/profile">
            <Button variant="outline">Profile, Cards & Preferences</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login Settings</Button>
          </Link>
        </div>
      </Card>
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
