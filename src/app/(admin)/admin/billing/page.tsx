"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type BillingItem = {
  trip_id: string;
  booking_id: string;
  pickup: string;
  dropoff: string;
  scheduled_at: string;
  rider_name?: string;
  rider_email?: string;
  state: string;
};

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

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: BillingItem[]; completedTripsCount: number }>("/admin/billing", undefined, session.accessToken)
      .then((r) => {
        setItems(r.items);
        setCount(r.completedTripsCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resolveRecipientEmail(riderEmail?: string) {
    if (recipientPreset === "rider") return riderEmail || sendToEmail;
    if (recipientPreset === "plan_manager") return planManagerEmail;
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
      const created = await apiJson<{ id: string; invoiceNumber: string }>("/admin/invoices/manual", {
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
      }, session.accessToken);
      setInvoiceId(created.id);
      if (sendNow) {
        const currentTrip = items.find((x) => x.trip_id === tripId);
        const toEmail = resolveRecipientEmail(currentTrip?.rider_email);
        if (!toEmail) {
          setMsg("Invoice created. Add recipient email/preset target to send.");
        } else {
          await apiJson(`/admin/invoices/${created.id}/send`, {
            method: "POST",
            body: JSON.stringify({ to: toEmail }),
          }, session.accessToken);
          setMsg("Xero-ready invoice generated and sent.");
        }
      } else {
        setMsg("Xero-ready invoice draft generated.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to generate invoice");
    } finally {
      setBusy(false);
    }
  }

  async function sendExistingInvoice(id: string, riderEmail?: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const to = resolveRecipientEmail(riderEmail);
    if (!to) {
      setMsg("Recipient email is required.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/admin/invoices/${id}/send`, {
        method: "POST",
        body: JSON.stringify({ to }),
      }, session.accessToken);
      setMsg("Invoice sent successfully.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to send invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Billing & Collections</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Automated invoicing, reconciliation, and payment messaging for riders, partners, and plan managers.
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
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create / Send Invoice</h2>
        <p className="mt-1 text-sm text-slate-600">Use completed trip details below to generate Xero-ready invoice drafts (NDIS supported).</p>
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
          <Input className="md:col-span-2" placeholder="Custom / fallback recipient email" value={sendToEmail} onChange={(e) => setSendToEmail(e.target.value)} />
          <Input placeholder="Plan manager email" value={planManagerEmail} onChange={(e) => setPlanManagerEmail(e.target.value)} />
          <Input placeholder="Partner email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
          <Input placeholder="Agent email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => generateInvoice(false)} disabled={busy}>{busy ? "Generating..." : "Generate Xero-ready Invoice"}</Button>
          <Button variant="outline" onClick={() => generateInvoice(true)} disabled={busy}>Send to Plan Manager</Button>
        </div>
        {invoiceId ? <p className="mt-2 text-xs text-slate-500">Last generated invoice ID: {invoiceId}</p> : null}
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Completed Trips (Billing Events)</h2>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No completed trips yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.trip_id} className="border-b">
                    <td className="py-2 pr-3 font-mono text-xs">{String(b.trip_id).slice(0, 8)}...</td>
                    <td className="py-2 pr-3">{b.rider_name || b.rider_email || "-"}</td>
                    <td className="py-2 pr-3">{b.pickup} → {b.dropoff}</td>
                    <td className="py-2 pr-3">{new Date(b.scheduled_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-3"><Badge tone="certified">{b.state}</Badge></td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/trips-history?trip=${b.trip_id}`}>
                          <Button variant="outline">View</Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTripId(b.trip_id);
                            setClientName(b.rider_name || "");
                            setSendToEmail(b.rider_email || "");
                            if (!amount) setAmount("45");
                          }}
                        >
                          Use Details
                        </Button>
                        {invoiceId ? (
                          <Button variant="outline" onClick={() => sendExistingInvoice(invoiceId, b.rider_email)}>
                            Send
                          </Button>
                        ) : null}
                      </div>
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
