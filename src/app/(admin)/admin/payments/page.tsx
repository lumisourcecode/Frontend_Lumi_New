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

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: BillingItem[] }>("/admin/billing", undefined, session.accessToken)
      .then((r) => setItems(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = items.length;

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
        <p className="mt-1 text-sm text-slate-600">Link payments to trip IDs. Full payment gateway coming soon.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Trip ID" />
          <Input placeholder="Payer name" />
          <Input placeholder="Amount" />
          <Select>
            <option>Method: Bank transfer</option>
            <option>Method: Cash</option>
            <option>Method: Card terminal</option>
          </Select>
          <Input className="md:col-span-2" placeholder="Transaction reference" />
          <Input type="date" />
          <Select>
            <option>Status: Pending confirmation</option>
            <option>Status: Confirmed</option>
            <option>Status: Rejected</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Confirmation notes" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled>Confirm Manual Payment (coming soon)</Button>
          <Button variant="outline" disabled>Upload Receipt</Button>
        </div>
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
