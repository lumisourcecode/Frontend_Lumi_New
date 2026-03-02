"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Client = { id: string; email: string; full_name?: string; ndis_id?: string; bookings_count?: string };

const monthlyCommissions = [
  { month: "Jan", amount: 3200, billed: true },
  { month: "Feb", amount: 4100, billed: true },
  { month: "Mar", amount: 3700, billed: false },
];

export default function AgentPartnersPage() {
  const [uploaded, setUploaded] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Client[] }>("/agent/clients", undefined, session.accessToken)
      .then((r) => setClients(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#15206A] to-[#2A8FBE] text-white">
        <h1 className="text-2xl font-bold">Partner Management</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Manage partner facilities, service agreements, operating history, and assigned client groups.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Add Partner Facility</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Facility Name" />
          <Input placeholder="Primary Contact" />
          <Input placeholder="Contact Email" />
          <Input placeholder="Phone" />
          <Select>
            <option>Type: Nursing Home</option>
            <option>Type: Aged Care Office</option>
            <option>Type: Disability Service</option>
            <option>Type: Mental Health Program</option>
          </Select>
          <Input placeholder="Service Suburb/Region" />
          <Textarea className="md:col-span-3" placeholder="Agreement terms, notes, and escalation preferences" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Add Partner</Button>
          <Button variant="outline">Save as Draft</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Bulk Booking Dashboard</h2>
        <p className="mt-2 text-sm text-slate-700">
          Upload CSV manifests for hospitals and aged care facilities.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input type="file" accept=".csv" className="min-h-11 rounded-2xl border border-slate-300 px-3 py-2" />
          <Button onClick={() => setUploaded(true)}>Upload Roster CSV</Button>
        </div>
        {uploaded ? <p className="mt-2 text-xs text-emerald-700">CSV queued for trip creation.</p> : null}
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--color-primary)]">Client Roster</h2>
        <p className="mt-1 text-xs text-slate-600">Clients you have created bookings for</p>
        <div className="mt-3 space-y-2 text-sm">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : clients.length === 0 ? (
            <p className="text-slate-500">No clients yet. Create bookings to add clients.</p>
          ) : (
            clients.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 p-3">
                {c.full_name || c.email} {c.ndis_id ? `- NDIS #${c.ndis_id}` : ""} <Badge tone="certified">Active</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--color-primary)]">Revenue Share</h2>
        <div className="mt-3 space-y-2">
          {monthlyCommissions.map((point) => (
            <div key={point.month}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{point.month}</span>
                <span>${point.amount}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.min(point.amount / 50, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs">
                Billing:{" "}
                <span className={point.billed ? "text-emerald-700" : "text-amber-700"}>
                  {point.billed ? "Settled" : "Pending"}
                </span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Partner History</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Lakeside Nursing Home | 24 months | 4,210 trips</div>
          <div className="rounded-xl border border-slate-200 p-3">North Health Group | 11 months | 1,806 trips</div>
        </div>
      </Card>
    </div>
  );
}
