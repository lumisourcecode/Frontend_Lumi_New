"use client";

import { useMemo, useState } from "react";
import {
  detectScheduleConflicts,
  optimizeTours,
  parseMemberHotlistCsv,
  type BookingSlot,
  type TimeOffSlot,
} from "@/lib/automation";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

const bookingsSeed: BookingSlot[] = [
  {
    id: "BK-301",
    riderName: "Riley Green",
    driverId: "DRV-1",
    startISO: "2026-02-20T08:00:00Z",
    endISO: "2026-02-20T09:00:00Z",
    recurring: true,
  },
];

const timeOffSeed: TimeOffSlot[] = [
  {
    driverId: "DRV-1",
    startISO: "2026-02-20T08:30:00Z",
    endISO: "2026-02-20T12:00:00Z",
    source: "EmploymentHero",
  },
];

const sampleHotlist = `card_number,status
7788112233,suspended
1234567890,active`;

export default function AdminDispatchPage() {
  const [matchingMode, setMatchingMode] = useState<"proximity" | "roundRobin">("proximity");
  const [optimized, setOptimized] = useState<string[]>([]);
  const [blockedCards, setBlockedCards] = useState<Set<string>>(new Set());
  const [bookingAdded, setBookingAdded] = useState(false);
  const [rosterCreated, setRosterCreated] = useState(false);

  const conflicts = useMemo(
    () => detectScheduleConflicts(bookingsSeed, timeOffSeed),
    [],
  );

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
            <Input placeholder="Rider name" />
            <Input placeholder="Phone" />
            <Input placeholder="Pickup" className="md:col-span-2" />
            <Input placeholder="Drop-off" className="md:col-span-2" />
            <Input type="date" />
            <Input type="time" />
            <Select>
              <option>Wheelchair-accessible</option>
              <option>Service Animal</option>
              <option>Carer Companion</option>
            </Select>
            <Select>
              <option>Pending Matching</option>
              <option>Assigned Manually</option>
            </Select>
            <Textarea className="md:col-span-2" placeholder="Booking notes" />
          </div>
          <Button className="mt-3" onClick={() => setBookingAdded(true)}>
            Create Manual Booking
          </Button>
          {bookingAdded ? <p className="mt-2 text-xs text-emerald-700">Booking created.</p> : null}
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--color-primary)]">Manual Roster Creation</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input placeholder="Driver" />
            <Input placeholder="Vehicle / Plate" />
            <Input type="date" />
            <Select>
              <option>Morning Shift</option>
              <option>Afternoon Shift</option>
              <option>Night Shift</option>
            </Select>
            <Input placeholder="Assigned zone" />
            <Input placeholder="Max trip load" />
          </div>
          <Button className="mt-3" onClick={() => setRosterCreated(true)}>
            Create Roster
          </Button>
          {rosterCreated ? <p className="mt-2 text-xs text-emerald-700">Roster created.</p> : null}
        </Card>
      </div>
    </div>
  );
}
