"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { googleMapsMultiStopUrl } from "@/lib/maps";

type TripState = "Assigned" | "Arrived" | "Picked Up" | "Drop Off";

type DriverTrip = {
  id: string;
  rider: string;
  riderEmail?: string;
  supportNeed: string;
  amount: number;
  state: TripState;
  pickup: string;
  dropoff: string;
  eta: string;
  riderRating: number;
};

function mapRowToTripState(row: { state: string; driver_route_phase?: string | null }): TripState {
  if (row.state === "Completed") return "Drop Off";
  if (row.state === "InProgress" || row.driver_route_phase === "passenger_onboard") return "Picked Up";
  if (row.driver_route_phase === "at_pickup") return "Arrived";
  return "Assigned";
}

function mapFromProgressApi(r: { driver_route_phase?: string; state?: string }): TripState {
  return mapRowToTripState({ state: r.state ?? "", driver_route_phase: r.driver_route_phase });
}

function nextProgressPhase(state: TripState): "at_pickup" | "passenger_onboard" | "dropped_off" | null {
  if (state === "Assigned") return "at_pickup";
  if (state === "Arrived") return "passenger_onboard";
  if (state === "Picked Up") return "dropped_off";
  return null;
}

function progressButtonLabel(state: TripState): string {
  if (state === "Assigned") return "Arrived at pickup";
  if (state === "Arrived") return "Passenger on board";
  if (state === "Picked Up") return "Complete drop-off";
  return "";
}

export default function DriverManifestPage() {
  const [section, setSection] = useState<
    "overview" | "manifest" | "available" | "history" | "profile" | "docs" | "support"
  >("manifest");
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [chatMessage, setChatMessage] = useState("");
  const [invoiceMsg, setInvoiceMsg] = useState<Record<string, string>>({});
  const [invoiceEmailDraft, setInvoiceEmailDraft] = useState<Record<string, string>>({});
  const [invoiceRecipientKind, setInvoiceRecipientKind] = useState<Record<string, string>>({});
  const [invoiceSending, setInvoiceSending] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [availableTrips, setAvailableTrips] = useState<
    Array<{
      id: string;
      pickup: string;
      dropoff: string;
      scheduled_at: string;
      rider_name: string;
      mobility_needs: string;
      pickup_state?: string | null;
    }>
  >([]);
  const [availableMeta, setAvailableMeta] = useState<{ driverServiceState: string | null; filterNote: string } | null>(null);
  const [pastTrips, setPastTrips] = useState<Array<{ id: string; date: string; rider: string; route: string; amount: string; rating: number }>>([]);
  const [profileData, setProfileData] = useState<{ fullName: string; phone: string; email: string; vehicleRego: string } | null>(null);
  const [documents, setDocuments] = useState<Array<{ name: string; status: string; expiry: string }>>([]);

  const isCompleted = (s: string) => s === "Drop Off" || s === "Completed";
  const completedCount = useMemo(() => trips.filter((trip) => isCompleted(trip.state)).length, [trips]);
  const todayEarnings = useMemo(
    () => trips.filter((trip) => isCompleted(trip.state)).reduce((acc, trip) => acc + trip.amount, 0),
    [trips],
  );
  const acceptanceRate = "98%";
  const onTimeRate = "97%";

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{
      items: Array<{
        id: string;
        state: string;
        driver_route_phase?: string | null;
        pickup: string;
        dropoff: string;
        scheduled_at: string;
        rider_name?: string;
        rider_email?: string;
        mobility_needs?: string;
      }>;
    }>("/driver/manifest", undefined, session.accessToken)
      .then((res) => {
        setTrips(
          (res.items || []).map((item, idx) => ({
            id: item.id,
            rider: item.rider_name || `Rider ${idx + 1}`,
            riderEmail: item.rider_email,
            supportNeed: item.mobility_needs || "General",
            amount: 0,
            state: mapRowToTripState(item),
            pickup: item.pickup,
            dropoff: item.dropoff,
            eta: new Date(item.scheduled_at).toLocaleTimeString(),
            riderRating: 5,
          })),
        );
      })
      .catch((e) => setApiError(e instanceof Error ? e.message : "Manifest load failed"));
    apiJson<{
      items: typeof availableTrips;
      driverServiceState?: string | null;
      filterNote?: string;
    }>("/driver/available-trips", undefined, session.accessToken)
      .then((r) => {
        setAvailableTrips(r.items);
        setAvailableMeta({
          driverServiceState: r.driverServiceState ?? null,
          filterNote: r.filterNote ?? "",
        });
      })
      .catch(() => {});
    apiJson<{ items: Array<{ id: string; state: string; pickup: string; dropoff: string; scheduled_at?: string; created_at?: string; rider_name?: string }> }>("/driver/earnings", undefined, session.accessToken)
      .then((r) => {
        setPastTrips(
          r.items
            .filter((t) => t.state === "Completed")
            .slice(0, 20)
            .map((t) => ({
              id: String(t.id).slice(0, 8),
              date: new Date(t.scheduled_at || t.created_at || "").toISOString().slice(0, 10) || "-",
              rider: t.rider_name || "Rider",
              route: `${t.pickup} to ${t.dropoff}`,
              amount: "-",
              rating: 5,
            })),
        );
      })
      .catch(() => {});
    apiJson<{ fullName: string; phone: string; email: string; vehicleRego: string }>("/driver/profile", undefined, session.accessToken)
      .then(setProfileData)
      .catch(() => {});
    apiJson<{ items: Array<{ doc_type: string; status: string; expiry: string | null }> }>("/driver/documents", undefined, session.accessToken)
      .then((r) => setDocuments(r.items.map((d) => ({ name: d.doc_type, status: d.status, expiry: d.expiry || "-" }))))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[#0e7490] text-white">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-100">Driver Command</p>
            <h1 className="mt-1 text-2xl font-bold">Manifest & Driver Super App</h1>
            <p className="mt-2 text-sm text-indigo-100">
              <strong className="text-white">Live Manifest</strong> shows only <em>your</em> assigned trips.{" "}
              <strong className="text-white">Available Trips</strong> lists open jobs matching your service state (set in
              profile/onboarding).
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
            ["available", "Available Trips"],
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
                  key as "overview" | "manifest" | "available" | "history" | "profile" | "docs" | "support",
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
                {!isCompleted(trip.state) ? (
                  <Button
                    onClick={() => {
                      const phase = nextProgressPhase(trip.state);
                      if (!phase) return;
                      const session = getAuthSession();
                      if (!session?.accessToken) return;
                      setApiError("");
                      apiJson<{ driver_route_phase?: string; state?: string }>(
                        `/driver/trips/${trip.id}/progress`,
                        { method: "PATCH", body: JSON.stringify({ phase }) },
                        session.accessToken,
                      )
                        .then((r) => {
                          setTrips((prev) =>
                            prev.map((t) =>
                              t.id === trip.id ? { ...t, state: mapFromProgressApi(r) } : t,
                            ),
                          );
                          if (phase === "dropped_off") {
                            setInvoiceMsg((m) => ({
                              ...m,
                              [trip.id]: "Trip completed. An invoice may be created automatically (see admin billing settings). Send manually below if needed.",
                            }));
                          }
                        })
                        .catch((e) =>
                          setApiError(e instanceof Error ? e.message : "Trip progress sync failed"),
                        );
                    }}
                  >
                    {progressButtonLabel(trip.state)}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <CheckCircle2 className="mr-2 size-4" />
                    Completed
                  </Button>
                )}
                <a
                  href={googleMapsMultiStopUrl(trip.pickup, trip.dropoff)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  <MapPinned className="size-4" />
                  Open in Maps
                </a>
                <Button variant="outline" type="button">
                  <MessageCircleMore className="mr-2 size-4" />
                  Message Rider
                </Button>
              </div>
              {isCompleted(trip.state) ? (
                <div className="mt-3 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-xs font-medium text-emerald-900">Invoice email</p>
                  <p className="text-xs text-emerald-800">
                    Sends the trip invoice PDF summary to rider, NDIA / plan manager, or any address (uses admin SMTP from Settings).
                  </p>
                  {invoiceMsg[trip.id] ? <p className="text-xs text-slate-700">{invoiceMsg[trip.id]}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="min-w-[140px]"
                      value={invoiceRecipientKind[trip.id] ?? "rider"}
                      onChange={(e) => {
                        const v = e.target.value;
                        setInvoiceRecipientKind((k) => ({ ...k, [trip.id]: v }));
                        if (v === "rider") {
                          setInvoiceEmailDraft((d) => ({ ...d, [trip.id]: trip.riderEmail ?? "" }));
                        }
                      }}
                    >
                      <option value="rider">Recipient: Rider account email</option>
                      <option value="ndia">Recipient: NDIA / other (enter email)</option>
                      <option value="plan_manager">Recipient: Plan manager (enter email)</option>
                    </Select>
                    <Input
                      className="min-w-[200px] flex-1"
                      placeholder="Email address"
                      type="email"
                      value={
                        invoiceEmailDraft[trip.id] ??
                        (invoiceRecipientKind[trip.id] === "rider" || invoiceRecipientKind[trip.id] === undefined
                          ? (trip.riderEmail ?? "")
                          : "")
                      }
                      onChange={(e) => setInvoiceEmailDraft((d) => ({ ...d, [trip.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      disabled={invoiceSending === trip.id}
                      onClick={() => {
                        const session = getAuthSession();
                        if (!session?.accessToken) return;
                        const to = (invoiceEmailDraft[trip.id] ?? trip.riderEmail ?? "").trim();
                        if (!to) {
                          setInvoiceMsg((m) => ({ ...m, [trip.id]: "Enter an email address." }));
                          return;
                        }
                        setInvoiceSending(trip.id);
                        setInvoiceMsg((m) => ({ ...m, [trip.id]: "" }));
                        apiJson(`/driver/trips/${trip.id}/send-invoice-email`, {
                          method: "POST",
                          body: JSON.stringify({ to }),
                        }, session.accessToken)
                          .then(() =>
                            setInvoiceMsg((m) => ({ ...m, [trip.id]: `Invoice emailed to ${to}.` })),
                          )
                          .catch((e) =>
                            setInvoiceMsg((m) => ({
                              ...m,
                              [trip.id]: e instanceof Error ? e.message : "Send failed (create invoice first if missing).",
                            })),
                          )
                          .finally(() => setInvoiceSending(null));
                      }}
                    >
                      {invoiceSending === trip.id ? "Sending…" : "Send invoice email"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {section === "available" ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Available Trips (Accept to add to your manifest)</h2>
          {availableMeta?.filterNote ? (
            <Card className="border-cyan-200 bg-cyan-50/80">
              <p className="text-sm text-cyan-950">{availableMeta.filterNote}</p>
              {availableMeta.driverServiceState ? (
                <p className="mt-1 text-xs text-cyan-800">
                  Your profile state: <strong>{availableMeta.driverServiceState}</strong>
                </p>
              ) : null}
            </Card>
          ) : null}
          {availableTrips.length === 0 ? (
            <Card><p className="text-sm text-slate-600">No available trips. Get approved first, then new ride requests will appear here.</p></Card>
          ) : (
            availableTrips.map((t) => (
              <Card key={t.id}>
                <p className="font-semibold">{t.rider_name || "Rider"}</p>
                <p className="text-sm text-slate-600">{t.pickup} → {t.dropoff}</p>
                <p className="text-xs text-slate-500">{new Date(t.scheduled_at).toLocaleString()}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.mobility_needs ? <Badge tone="default">{t.mobility_needs}</Badge> : null}
                  {t.pickup_state ? (
                    <Badge tone="certified" className="bg-slate-700 text-white">
                      Region {t.pickup_state}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={googleMapsMultiStopUrl(t.pickup, t.dropoff)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Preview route (Maps)
                  </a>
                </div>
                <Button
                  className="mt-3"
                  onClick={async () => {
                    const s = getAuthSession();
                    if (!s?.accessToken) return;
                    try {
                      await apiJson(`/driver/trips/${t.id}/accept`, { method: "POST" }, s.accessToken);
                      setAvailableTrips((prev) => prev.filter((x) => x.id !== t.id));
                      apiJson<{
                        items: Array<{
                          id: string;
                          state: string;
                          driver_route_phase?: string | null;
                          pickup: string;
                          dropoff: string;
                          scheduled_at: string;
                          rider_name?: string;
                          rider_email?: string;
                          mobility_needs?: string;
                        }>;
                      }>("/driver/manifest", undefined, s.accessToken)
                        .then((res) => {
                          setTrips(res.items.map((item, idx) => ({
                            id: item.id,
                            rider: item.rider_name || `Rider ${idx + 1}`,
                            riderEmail: item.rider_email,
                            supportNeed: item.mobility_needs || "General",
                            amount: 0,
                            state: mapRowToTripState(item),
                            pickup: item.pickup,
                            dropoff: item.dropoff,
                            eta: new Date(item.scheduled_at).toLocaleTimeString(),
                            riderRating: 5,
                          })));
                        });
                    } catch (e) {
                      setApiError(e instanceof Error ? e.message : "Accept failed");
                    }
                  }}
                >
                  Accept Trip
                </Button>
              </Card>
            ))
          )}
        </div>
      ) : null}

      {apiError ? <Card><p className="text-sm text-red-600">{apiError}</p></Card> : null}

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
                Name: {profileData?.fullName || "—"}
              </p>
              <p>Phone: {profileData?.phone || "—"}</p>
              <p>Email: {profileData?.email || "—"}</p>
              <p>Vehicle: {profileData?.vehicleRego || "—"}</p>
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
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500">No documents yet. Add from Documents page.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium text-[var(--color-primary)]">
                    <FileBadge2 className="size-4 text-[var(--color-primary)]" />
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-600">Expiry: {doc.expiry}</p>
                  <Badge tone={doc.status === "Approved" ? "certified" : "pending"}>{doc.status}</Badge>
                  <Button variant="outline">Upload New Copy</Button>
                </div>
              ))
            )}
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
        <p className="text-sm font-semibold text-[var(--color-primary)]">Invoices & trip updates</p>
        <p className="mt-2 text-xs text-slate-600">
          When you complete drop-off, riders and admins get in-app notifications for each step. Invoices are created from platform settings
          (admin → Settings); use <strong>Send invoice email</strong> on each completed trip to reach rider, NDIA, or plan manager.
        </p>
      </Card>
    </div>
  );
}
