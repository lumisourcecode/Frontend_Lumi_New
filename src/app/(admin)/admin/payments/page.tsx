"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
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

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [status, setStatus] = useState("confirmed");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: BillingItem[] }>("/admin/billing", undefined, session.accessToken)
      .then((r) => setItems(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = items.length;

  async function confirmManualPayment() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!recipientId || !amount) {
      setMsg("Recipient user ID and amount are required.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson("/admin/invoices/manual", {
        method: "POST",
        body: JSON.stringify({
          recipientId,
          notes: `Manual payment confirmation | trip=${tripId || "N/A"} | payer=${payerName || "N/A"} | method=${method} | status=${status} | ${notes || ""}`,
          items: [
            {
              description: `Manual payment receipt for trip ${tripId || "N/A"}`,
              quantity: 1,
              unitPrice: Number(amount) || 0,
            },
          ],
        }),
      }, session.accessToken);
      setMsg("Manual payment recorded as billing document.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to confirm payment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Payments & Confirmation</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track automatic and manual payments, reconcile exceptions, and confirm receipts with full audit trail.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Completed Trips</p>
          <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Billable</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{completedCount}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Manual Payment Confirmation</h2>
        <p className="mt-1 text-sm text-slate-600">Link payments to trips and store them as invoice-backed records.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Trip ID" value={tripId} onChange={(e) => setTripId(e.target.value)} />
          <Input placeholder="Recipient User ID" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} />
          <Input placeholder="Payer name" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
          <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="bank_transfer">Method: Bank transfer</option>
            <option value="cash">Method: Cash</option>
            <option value="card_terminal">Method: Card terminal</option>
          </Select>
          <Input className="md:col-span-2" placeholder="Transaction reference" />
          <Input type="date" />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending_confirmation">Status: Pending confirmation</option>
            <option value="confirmed">Status: Confirmed</option>
            <option value="rejected">Status: Rejected</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Confirmation notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={confirmManualPayment} disabled={busy}>{busy ? "Saving..." : "Confirm Manual Payment"}</Button>
          <Button variant="outline" onClick={confirmManualPayment} disabled={busy}>Upload Receipt</Button>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Completed Trips (Payment Status)</h2>
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
                    <td className="py-2 pr-3">
                      <Badge tone="certified">Completed</Badge>
                    </td>
                    <td className="py-2">
                      <Link href="/admin/billing">
                        <Button variant="outline">View Billing</Button>
                      </Link>
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
