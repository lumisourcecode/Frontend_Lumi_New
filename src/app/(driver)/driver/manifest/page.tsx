"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileBadge2,
  Headset,
  MapPinned,
  MessageCircleMore,
  ShieldAlert,
  Star,
  Timer,
  UserRound,
} from "lucide-react";
import { generateXeroReadyInvoice } from "@/lib/automation";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

type TripState = "Assigned" | "Arrived" | "Picked Up" | "Drop Off";

type DriverTrip = {
  id: string;
  rider: string;
  supportNeed: string;
  amount: number;
  state: TripState;
  pickup: string;
  dropoff: string;
  eta: string;
  riderRating: number;
};

export default function DriverManifestPage() {
  const [section, setSection] = useState<
    "overview" | "manifest" | "history" | "profile" | "docs" | "support"
  >("overview");
  const [trips, setTrips] = useState<DriverTrip[]>([
    {
      id: "TRP-110",
      rider: "Ava Smith",
      supportNeed: "Wheelchair",
      amount: 74,
      state: "Assigned",
      pickup: "Glen Waverley",
      dropoff: "Monash Medical Centre",
      eta: "08 mins",
      riderRating: 4.8,
    },
    {
      id: "TRP-121",
      rider: "Leo Khan",
      supportNeed: "Service Animal",
      amount: 52,
      state: "Assigned",
      pickup: "Oakleigh",
      dropoff: "Huntingdale Clinic",
      eta: "12 mins",
      riderRating: 4.9,
    },
  ]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [chatMessage, setChatMessage] = useState("");
  const [lastInvoice, setLastInvoice] = useState<string>("");

  const pastTrips = [
    { id: "TRP-101", date: "2026-02-14", rider: "Noah Lee", route: "Clayton to Dandenong", amount: "$61.00", rating: 5.0 },
    { id: "TRP-089", date: "2026-02-13", rider: "Emma Ross", route: "Glen Iris to Malvern", amount: "$48.00", rating: 4.7 },
    { id: "TRP-082", date: "2026-02-12", rider: "Mia Cooper", route: "Box Hill to Richmond", amount: "$55.00", rating: 4.9 },
  ];

  const documents = [
    { name: "Driver License", status: "Verified", expiry: "2028-09-12" },
    { name: "Police Check", status: "Verified", expiry: "2027-03-18" },
    { name: "NDIS Worker Screening", status: "Pending Renewal", expiry: "2026-03-01" },
    { name: "First Aid / CPR", status: "Verified", expiry: "2026-11-20" },
    { name: "Manual Handling", status: "Verified", expiry: "2026-08-08" },
  ];

  const nextState = (state: TripState): TripState => {
    if (state === "Assigned") return "Arrived";
    if (state === "Arrived") return "Picked Up";
    return "Drop Off";
  };

  const completedCount = useMemo(() => trips.filter((trip) => trip.state === "Drop Off").length, [trips]);
  const todayEarnings = useMemo(
    () => trips.filter((trip) => trip.state === "Drop Off").reduce((acc, trip) => acc + trip.amount, 0),
    [trips],
  );
  const acceptanceRate = "98%";
  const onTimeRate = "97%";

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[#0e7490] text-white">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-100">Driver Command</p>
            <h1 className="mt-1 text-2xl font-bold">Manifest & Driver Super App</h1>
            <p className="mt-2 text-sm text-indigo-100">
              Manage trips, profile, documents, support chat, payouts, and full ride history in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-3">
            <div>
              <p className="text-xs text-indigo-100">Completed Today</p>
              <p className="text-xl font-bold">{completedCount}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-100">Today Earnings</p>
              <p className="text-xl font-bold">${todayEarnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-100">Acceptance</p>
              <p className="text-xl font-bold">{acceptanceRate}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-100">On-time</p>
              <p className="text-xl font-bold">{onTimeRate}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            ["overview", "Overview"],
            ["manifest", "Live Manifest"],
            ["history", "My Rides"],
            ["profile", "Driver Profile"],
            ["docs", "Documents"],
            ["support", "Support"],
          ].map(([key, label]) => (
            <Button
              key={key}
              variant={section === key ? "primary" : "outline"}
              onClick={() =>
                setSection(
                  key as "overview" | "manifest" | "history" | "profile" | "docs" | "support",
                )
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {section === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <h2 className="text-lg font-bold text-[var(--color-primary)]">Shift Overview</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <Timer className="size-4 text-[var(--color-primary)]" />
                  Shift Time
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-primary)]">07h 18m</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPinned className="size-4 text-[var(--color-primary)]" />
                  Next Pickup ETA
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-primary)]">{trips[0]?.eta}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <CreditCard className="size-4 text-[var(--color-primary)]" />
                  Pending Payout
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-primary)]">$134.00</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
              Live route map placeholder (Uber/Doordash-style route & batching view).
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">Priority Alerts</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-800">Manual handling note on TRP-110</div>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-800">Dispatch update: route optimized</div>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-800">Document renewal due in 13 days</div>
            </div>
          </Card>
        </div>
      ) : null}

      {section === "manifest" ? (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--color-primary)]">{trip.rider}</p>
                  <p className="text-xs text-slate-600">
                    {trip.id} | {trip.pickup} to {trip.dropoff}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="default">{trip.supportNeed}</Badge>
                  <Badge tone={trip.state === "Drop Off" ? "certified" : "pending"}>{trip.state}</Badge>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <p className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" />
                  ETA {trip.eta}
                </p>
                <p className="flex items-center gap-1">
                  <Star className="size-3.5" />
                  Rider {trip.riderRating}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.state !== "Drop Off" ? (
                  <Button
                    onClick={() => {
                      const next = nextState(trip.state);
                      setTrips((prev) =>
                        prev.map((t) =>
                          t.id === trip.id ? { ...t, state: next } : t,
                        ),
                      );
                      if (next === "Drop Off") {
                        const invoice = generateXeroReadyInvoice({
                          tripId: trip.id,
                          participantName: trip.rider,
                          planManagerEmail: "planmanager@example.com",
                          amount: trip.amount,
                          supportCategory: "Transport",
                        });
                        setLastInvoice(`${invoice.invoiceNumber} (${invoice.exportFormat})`);
                      }
                    }}
                  >
                    {nextState(trip.state)}
                  </Button>
                ) : (
                  <Button variant="outline">
                    <CheckCircle2 className="mr-2 size-4" />
                    Invoice Generated
                  </Button>
                )}
                <Button variant="outline">
                  <MapPinned className="mr-2 size-4" />
                  Open Navigation
                </Button>
                <Button variant="outline">
                  <MessageCircleMore className="mr-2 size-4" />
                  Message Rider
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {section === "history" ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-[var(--color-primary)]">My Rides History</h3>
            <div className="flex items-center gap-2">
              <Select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="w-40">
                <option value="all">All Rides</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              <Input placeholder="Search trip ID" className="w-40" />
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {pastTrips.map((trip) => (
                  <tr key={trip.id} className="border-b">
                    <td className="py-2 pr-3">{trip.id}</td>
                    <td className="py-2 pr-3">{trip.date}</td>
                    <td className="py-2 pr-3">{trip.rider}</td>
                    <td className="py-2 pr-3">{trip.route}</td>
                    <td className="py-2 pr-3">{trip.amount}</td>
                    <td className="py-2">{trip.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {section === "profile" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">Driver Profile</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <UserRound className="size-4 text-[#2A2E9A]" />
                Name: Liam Tran
              </p>
              <p>Phone: +61 404 222 191</p>
              <p>Email: liam.tran@lumiride.com.au</p>
              <p>Service Zone: South-East Metro</p>
              <p>Vehicle: Kia Carnival (1AB-2CD)</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="certified">NDIS Certified</Badge>
              <Badge tone="certified">Police Check Verified</Badge>
              <Badge tone="pending">Manual Handling Renewal Soon</Badge>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">Performance</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Lifetime Trips</p>
                <p className="text-lg font-semibold text-[#141B63]">1,286</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Avg Rating</p>
                <p className="text-lg font-semibold text-[#141B63]">4.92</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Cancellation Rate</p>
                <p className="text-lg font-semibold text-[#141B63]">1.1%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Support Tickets</p>
                <p className="text-lg font-semibold text-[#141B63]">2 Open</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {section === "docs" ? (
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Documents & Verification</h3>
          <div className="mt-3 space-y-2">
            {documents.map((doc) => (
              <div key={doc.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-[var(--color-primary)]">
                  <FileBadge2 className="size-4 text-[var(--color-primary)]" />
                  {doc.name}
                </p>
                <p className="text-xs text-slate-600">Expiry: {doc.expiry}</p>
                <Badge tone={doc.status.includes("Verified") ? "certified" : "pending"}>{doc.status}</Badge>
                <Button variant="outline">Upload New Copy</Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {section === "support" ? (
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-[var(--color-primary)]">In-app Support Chat</h3>
            <div className="mt-2 rounded-2xl bg-slate-50 p-3 text-sm">Admin: Please confirm arrival ETA for TRP-121.</div>
            <div className="mt-2 flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Message rider/admin"
              />
              <Button onClick={() => setChatMessage("")}>Send</Button>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h4 className="font-semibold text-[var(--color-primary)]">Emergency & Incident</h4>
              <Button variant="danger" className="mt-3 w-full">
                <ShieldAlert className="mr-2 size-4" /> SOS
              </Button>
              <p className="mt-2 text-xs text-slate-600">Triggers immediate dispatch escalation and safety workflow.</p>
            </Card>

            <Card>
              <h4 className="font-semibold text-[var(--color-primary)]">Support Contacts</h4>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Headset className="size-4 text-[var(--color-primary)]" />
                  Dispatch Hotline: 1300 586 474
                </p>
                <p className="flex items-center gap-2">
                  <BellRing className="size-4 text-[var(--color-primary)]" />
                  Escalation Team: operations@lumiride.com.au
                </p>
                <Textarea placeholder="Describe issue for support team" />
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <Card>
        <p className="text-sm font-semibold text-[var(--color-primary)]">Auto Invoice Log</p>
        {lastInvoice ? (
          <p className="mt-2 text-xs text-emerald-700">Latest: {lastInvoice}</p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">No completed invoice yet in this session.</p>
        )}
      </Card>
    </div>
  );
}
