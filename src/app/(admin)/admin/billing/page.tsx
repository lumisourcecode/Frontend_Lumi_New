"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiBlob, apiJson, getAuthSession } from "@/lib/api-client";

type BillingItem = {
  trip_id: string;
  booking_id: string;
  rider_id?: string;
  pickup: string;
  dropoff: string;
  scheduled_at: string;
  rider_name?: string;
  rider_email?: string;
  rider_phone?: string;
  ndis_id?: string;
  plan_manager_email?: string | null;
  mobility_needs?: string | null;
  booking_notes?: string | null;
  is_ndis?: boolean;
  final_cost?: string | number | null;
  estimated_cost?: string | number | null;
  distance_km?: string | number | null;
  trip_completed_at?: string;
  driver_name?: string | null;
  driver_email?: string | null;
  invoice_id?: string | null;
  invoice_number?: string | null;
  invoice_status?: string | null;
  state: string;
};

type TripDetailResponse = {
  trip: Record<string, unknown>;
  invoices: Array<Record<string, unknown>>;
  notifications: Array<{ id: string; type: string; payload: unknown; read_at: string | null; created_at: string }>;
  activity: Array<{ id: string; user_id: string | null; action: string; payload: unknown; created_at: string }>;
};

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekBucket(scheduledAt: string): "this" | "prev" | "older" {
  const ride = new Date(scheduledAt);
  if (Number.isNaN(ride.getTime())) return "older";
  const now = new Date();
  const thisStart = startOfWeekMonday(now);
  const prevStart = new Date(thisStart);
  prevStart.setDate(prevStart.getDate() - 7);
  const rideStart = startOfWeekMonday(ride);
  if (rideStart.getTime() === thisStart.getTime()) return "this";
  if (rideStart.getTime() === prevStart.getTime()) return "prev";
  return "older";
}

function partitionByWeek(items: BillingItem[]) {
  const thisW: BillingItem[] = [];
  const prevW: BillingItem[] = [];
  const older: BillingItem[] = [];
  for (const b of items) {
    const k = weekBucket(b.scheduled_at);
    if (k === "this") thisW.push(b);
    else if (k === "prev") prevW.push(b);
    else older.push(b);
  }
  return [
    { key: "this", label: "This week", items: thisW },
    { key: "prev", label: "Previous week", items: prevW },
    { key: "older", label: "Earlier", items: older },
  ].filter((g) => g.items.length > 0);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatMoney(n: string | number | null | undefined): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `$${v.toFixed(2)}`;
}

export default function AdminBillingPage() {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [scheme, setScheme] = useState("NDIS");
  const [amount, setAmount] = useState("");
  const [sendToEmail, setSendToEmail] = useState("");
  const [planManagerEmail, setPlanManagerEmail] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [recipientPreset, setRecipientPreset] = useState<"rider" | "plan_manager" | "partner" | "agent" | "custom">("rider");
  const [invoiceId, setInvoiceId] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [detailTripId, setDetailTripId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TripDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const refreshList = useCallback(async () => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const r = await apiJson<{ items: BillingItem[]; completedTripsCount: number }>(
      "/admin/billing",
      undefined,
      session.accessToken,
    );
    setItems(r.items);
    setCount(r.completedTripsCount);
  }, []);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    refreshList()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshList]);

  useEffect(() => {
    if (!detailTripId) {
      setDetail(null);
      return;
    }
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setDetailLoading(true);
    setDetail(null);
    apiJson<TripDetailResponse>(`/admin/billing/trips/${detailTripId}/detail`, undefined, session.accessToken)
      .then(setDetail)
      .catch((e) => setMsg(e instanceof Error ? e.message : "Failed to load trip detail"))
      .finally(() => setDetailLoading(false));
  }, [detailTripId]);

  const groups = useMemo(() => partitionByWeek(items), [items]);

  function resolveRecipientEmail(riderEmail?: string, rowPlanMgr?: string | null) {
    if (recipientPreset === "rider") return riderEmail || sendToEmail;
    if (recipientPreset === "plan_manager") return planManagerEmail || rowPlanMgr || "";
    if (recipientPreset === "partner") return partnerEmail;
    if (recipientPreset === "agent") return agentEmail;
    return sendToEmail;
  }

  async function generateInvoice(sendNow = false) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!recipientId || !amount) {
      setMsg("Recipient user ID and amount are required.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const numeric = Number(amount);
      const created = await apiJson<{ id: string; invoiceNumber: string }>(
        "/admin/billing/invoice-manual",
        {
          method: "POST",
          body: JSON.stringify({
            recipientId,
            notes: `Trip ${tripId || "manual"} | ${scheme} | Client: ${clientName || "N/A"}`,
            items: [
              {
                description: `Transport invoice for ${tripId || "manual entry"}`,
                ndisSupportItem: scheme === "NDIS" ? "04_590_0125_6_1" : undefined,
                quantity: 1,
                unitPrice: Number.isFinite(numeric) ? numeric : 0,
              },
            ],
          }),
        },
        session.accessToken,
      );
      setInvoiceId(created.id);
      if (sendNow) {
        const currentTrip = items.find((x) => x.trip_id === tripId);
        const toEmail = resolveRecipientEmail(currentTrip?.rider_email, currentTrip?.plan_manager_email);
        if (!toEmail) {
          setMsg("Invoice created. Add recipient email/preset target to send.");
        } else {
          await apiJson(
            `/admin/billing/invoices/${created.id}/send`,
            { method: "POST", body: JSON.stringify({ to: toEmail }) },
            session.accessToken,
          );
          setMsg("Invoice generated and sent (uses admin SMTP / env when configured).");
        }
      } else {
        setMsg("Invoice draft created.");
      }
      await refreshList();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to generate invoice");
    } finally {
      setBusy(false);
    }
  }

  async function sendExistingInvoice(id: string, riderEmail?: string, rowPlanMgr?: string | null) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const to = resolveRecipientEmail(riderEmail, rowPlanMgr);
    if (!to) {
      setMsg("Recipient email is required.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson(
        `/admin/billing/invoices/${id}/send`,
        { method: "POST", body: JSON.stringify({ to }) },
        session.accessToken,
      );
      setMsg("Invoice sent successfully.");
      await refreshList();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to send invoice");
    } finally {
      setBusy(false);
    }
  }

  async function prepareFromTrip(tripIdParam: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      const data = await apiJson<{ invoice: { id: string; invoice_number: string; reused?: boolean } }>(
        "/admin/billing/invoice-from-trip",
        { method: "POST", body: JSON.stringify({ tripId: tripIdParam }) },
        session.accessToken,
      );
      setMsg(
        `Invoice ${data.invoice.invoice_number}${data.invoice.reused ? " (already existed)" : " prepared"}.`,
      );
      await refreshList();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Prepare invoice failed");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf(invoiceIdParam: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      const { blob, filename } = await apiBlob(`/admin/billing/invoices/${invoiceIdParam}/pdf`, session.accessToken);
      downloadBlob(blob, filename ?? `invoice-${invoiceIdParam}.pdf`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  async function sendToRider(invoiceIdParam: string, email?: string) {
    if (!email?.trim()) {
      setMsg("No rider email on file.");
      return;
    }
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(
        `/admin/billing/invoices/${invoiceIdParam}/send`,
        { method: "POST", body: JSON.stringify({ to: email.trim() }) },
        session.accessToken,
      );
      setMsg("Invoice sent to rider.");
      await refreshList();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  async function sendToPlanManager(invoiceIdParam: string, pm?: string | null) {
    if (!pm?.trim()) {
      setMsg("No plan manager email on rider profile. Add plan_manager_email in rider profile.");
      return;
    }
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(
        `/admin/billing/invoices/${invoiceIdParam}/send`,
        { method: "POST", body: JSON.stringify({ to: pm.trim() }) },
        session.accessToken,
      );
      setMsg("Invoice sent to plan manager.");
      await refreshList();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  async function bulkPrepare() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const tripIds = Array.from(selected);
    if (!tripIds.length) {
      setMsg("Select at least one trip.");
      return;
    }
    if (tripIds.length > 100) {
      setMsg("Maximum 100 trips per bulk prepare.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson(
        "/admin/billing/bulk-invoices-from-trips",
        { method: "POST", body: JSON.stringify({ tripIds }) },
        session.accessToken,
      );
      setMsg(`Bulk prepare finished for ${tripIds.length} trip(s). Refresh list for invoice IDs.`);
      await refreshList();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Bulk prepare failed");
    } finally {
      setBusy(false);
    }
  }

  async function bulkZip() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const invIds = items.filter((b) => selected.has(b.trip_id) && b.invoice_id).map((b) => String(b.invoice_id));
    if (!invIds.length) {
      setMsg("Select trips that already have invoices, or run Prepare first.");
      return;
    }
    if (invIds.length > 40) {
      setMsg("ZIP allows at most 40 invoices; reduce selection.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const { blob, filename } = await apiBlob(
        `/admin/billing/invoices-zip?ids=${encodeURIComponent(invIds.join(","))}`,
        session.accessToken,
      );
      downloadBlob(blob, filename ?? "lumi-invoices.zip");
      setMsg(`Downloaded ZIP (${invIds.length} PDFs).`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ZIP download failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function selectAllInGroup(groupItems: BillingItem[], on: boolean) {
    setSelected((prev) => {
      const n = new Set(prev);
      for (const b of groupItems) {
        if (on) n.add(b.trip_id);
        else n.delete(b.trip_id);
      }
      return n;
    });
  }

  const allTripIds = items.map((b) => b.trip_id);
  const allSelected = allTripIds.length > 0 && allTripIds.every((id) => selected.has(id));

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Billing & Collections</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Automated invoicing, reconciliation, and payment messaging for riders, partners, and plan managers. Outbound
          email uses{" "}
          <strong className="font-semibold">Admin SMTP settings</strong> (portal) or <code className="text-indigo-200">SMTP_*</code>{" "}
          in environment when no admin profile is active.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Completed Trips (Billable)</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{count}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">In List</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{items.length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create / Send Invoice (manual)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ad-hoc invoices still go through billing; delivery uses your configured SMTP.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Trip ID" value={tripId} onChange={(e) => setTripId(e.target.value)} />
          <Input placeholder="Recipient User ID" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} />
          <Input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <Select value={scheme} onChange={(e) => setScheme(e.target.value)}>
            <option>NDIS</option>
            <option>Private Pay</option>
            <option>Partner Invoice</option>
          </Select>
          <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select value={recipientPreset} onChange={(e) => setRecipientPreset(e.target.value as typeof recipientPreset)}>
            <option value="rider">Recipient: Rider Email</option>
            <option value="plan_manager">Recipient: Plan Manager</option>
            <option value="partner">Recipient: Partner</option>
            <option value="agent">Recipient: Agent</option>
            <option value="custom">Recipient: Custom</option>
          </Select>
          <Input
            className="md:col-span-2"
            placeholder="Custom / fallback recipient email"
            value={sendToEmail}
            onChange={(e) => setSendToEmail(e.target.value)}
          />
          <Input placeholder="Plan manager email" value={planManagerEmail} onChange={(e) => setPlanManagerEmail(e.target.value)} />
          <Input placeholder="Partner email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
          <Input placeholder="Agent email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => generateInvoice(false)} disabled={busy}>
            {busy ? "Working..." : "Generate invoice draft"}
          </Button>
          <Button variant="outline" onClick={() => generateInvoice(true)} disabled={busy}>
            Generate & send
          </Button>
        </div>
        {invoiceId ? <p className="mt-2 text-xs text-slate-500">Last manual invoice ID: {invoiceId}</p> : null}
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Completed Trips (Billing Events)</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => selectAllInGroup(items, !allSelected)} disabled={!items.length}>
              {allSelected ? "Clear all" : "Select all"}
            </Button>
            <Button size="sm" onClick={bulkPrepare} disabled={busy || !selected.size}>
              Bulk prepare invoices
            </Button>
            <Button variant="outline" size="sm" onClick={bulkZip} disabled={busy || !selected.size}>
              Download ZIP (selected with invoices)
            </Button>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Rows are grouped by calendar week (Monday start). Use Details for full trip data and notification history. ZIP
          supports up to 40 invoice PDFs per download.
        </p>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No completed trips yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="w-10 py-2 pr-2" />
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Cost</th>
                  <th className="py-2 pr-3">Invoice</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <Fragment key={group.key}>
                    <tr className="bg-slate-100">
                      <td colSpan={9} className="py-2 pl-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <span className="mr-3">{group.label}</span>
                        <button
                          type="button"
                          className="text-[var(--color-primary)] underline"
                          onClick={() => selectAllInGroup(group.items, true)}
                        >
                          Select section
                        </button>
                      </td>
                    </tr>
                    {group.items.map((b) => (
                      <tr key={b.trip_id} className="border-b">
                        <td className="py-2 pr-2 align-top">
                          <input
                            type="checkbox"
                            checked={selected.has(b.trip_id)}
                            onChange={() => toggleSelect(b.trip_id)}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                            aria-label={`Select trip ${b.trip_id}`}
                          />
                        </td>
                        <td className="py-2 pr-3 align-top font-mono text-xs">{String(b.trip_id).slice(0, 8)}…</td>
                        <td className="py-2 pr-3 align-top">
                          <div>{b.rider_name || b.rider_email || "—"}</div>
                          {b.rider_email ? <div className="text-xs text-slate-500">{b.rider_email}</div> : null}
                          {b.plan_manager_email ? (
                            <div className="text-xs text-slate-500">PM: {b.plan_manager_email}</div>
                          ) : null}
                        </td>
                        <td className="max-w-xs py-2 pr-3 align-top text-xs">
                          {b.pickup} → {b.dropoff}
                        </td>
                        <td className="py-2 pr-3 align-top whitespace-nowrap">
                          {new Date(b.scheduled_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-3 align-top whitespace-nowrap">{formatMoney(b.final_cost ?? b.estimated_cost)}</td>
                        <td className="py-2 pr-3 align-top text-xs">
                          {b.invoice_number ? (
                            <>
                              <div className="font-mono">{b.invoice_number}</div>
                              <div className="text-slate-500">{b.invoice_status ?? ""}</div>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 pr-3 align-top">
                          <Badge tone="certified">{b.state}</Badge>
                        </td>
                        <td className="py-2 align-top">
                          <div className="flex min-w-[10rem] flex-col gap-1">
                            <Button variant="outline" size="sm" onClick={() => setDetailTripId(b.trip_id)}>
                              Details
                            </Button>
                            <Link href={`/admin/trips-history?trip=${b.trip_id}`}>
                              <Button variant="outline" size="sm" className="w-full">
                                View history
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => prepareFromTrip(b.trip_id)} disabled={busy}>
                              Prepare invoice
                            </Button>
                            {b.invoice_id ? (
                              <>
                                <Button variant="outline" size="sm" onClick={() => downloadPdf(String(b.invoice_id))} disabled={busy}>
                                  Download PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendToRider(String(b.invoice_id), b.rider_email)}
                                  disabled={busy}
                                >
                                  Send to rider
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendToPlanManager(String(b.invoice_id), b.plan_manager_email)}
                                  disabled={busy}
                                >
                                  Send to plan manager
                                </Button>
                              </>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTripId(b.trip_id);
                                setRecipientId(b.rider_id || recipientId);
                                setClientName(b.rider_name || "");
                                setSendToEmail(b.rider_email || "");
                                setPlanManagerEmail(b.plan_manager_email || planManagerEmail);
                                if (!amount) setAmount(String(Number(b.final_cost) || Number(b.estimated_cost) || 45));
                              }}
                            >
                              Use in manual form
                            </Button>
                            {invoiceId ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendExistingInvoice(invoiceId, b.rider_email, b.plan_manager_email)}
                              >
                                Send last manual
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {detailTripId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trip-detail-title"
        >
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden shadow-xl">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
              <h2 id="trip-detail-title" className="text-lg font-semibold text-[var(--color-primary)]">
                Trip & messaging detail
              </h2>
              <Button variant="outline" size="sm" onClick={() => setDetailTripId(null)}>
                Close
              </Button>
            </div>
            <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-4 text-sm">
              {detailLoading ? (
                <p className="text-slate-500">Loading…</p>
              ) : !detail ? (
                <p className="text-slate-500">No data.</p>
              ) : (
                <div className="space-y-6">
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-800">Booking & trip</h3>
                    <dl className="grid gap-1 text-slate-600">
                      {Object.entries(detail.trip)
                        .filter(([k]) => !k.startsWith("_"))
                        .map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[8rem_1fr] gap-2 border-b border-slate-50 py-1">
                            <dt className="text-xs uppercase text-slate-400">{k}</dt>
                            <dd className="break-all font-mono text-xs">
                              {v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </section>
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-800">Invoices</h3>
                    {detail.invoices.length === 0 ? (
                      <p className="text-slate-500">None yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {detail.invoices.map((inv) => (
                          <li key={String(inv.id)} className="rounded border border-slate-100 p-2 text-xs">
                            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(inv, null, 2)}</pre>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-800">Notifications (trip-linked)</h3>
                    {detail.notifications.length === 0 ? (
                      <p className="text-slate-500">No stored notifications for this trip.</p>
                    ) : (
                      <ul className="space-y-2">
                        {detail.notifications.map((n) => (
                          <li key={n.id} className="rounded border border-slate-100 p-2 text-xs">
                            <div className="font-medium text-slate-700">{n.type}</div>
                            <div className="text-slate-500">{new Date(n.created_at).toLocaleString()}</div>
                            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-slate-600">
                              {typeof n.payload === "object" ? JSON.stringify(n.payload, null, 2) : String(n.payload)}
                            </pre>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-800">Admin activity</h3>
                    {detail.activity.length === 0 ? (
                      <p className="text-slate-500">No trip-scoped activity log entries.</p>
                    ) : (
                      <ul className="space-y-2">
                        {detail.activity.map((a) => (
                          <li key={a.id} className="rounded border border-slate-100 p-2 text-xs">
                            <div className="font-medium">{a.action}</div>
                            <div className="text-slate-500">{new Date(a.created_at).toLocaleString()}</div>
                            <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all">
                              {typeof a.payload === "object" ? JSON.stringify(a.payload, null, 2) : String(a.payload)}
                            </pre>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
