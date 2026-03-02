"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Client = { id: string; email: string; full_name?: string; phone?: string; ndis_id?: string; bookings_count?: string };

export default function AgentClientsPage() {
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
      <Card className="border-none bg-gradient-to-r from-[#16206C] to-[#2A8CBC] text-white">
        <h1 className="text-2xl font-bold">Client Registry</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Add and manage residents/patients with full transport, support, and billing profiles.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Add New Client</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Client full name" />
          <Input placeholder="NDIS / Facility ID" />
          <Input placeholder="Date of Birth" type="date" />
          <Input placeholder="Primary contact" />
          <Input placeholder="Emergency contact" />
          <Select>
            <option>Support Level: Standard</option>
            <option>Support Level: High Assistance</option>
            <option>Support Level: Complex Needs</option>
          </Select>
          <Input placeholder="Pickup address" className="md:col-span-2" />
          <Input placeholder="Preferred destination" />
          <Select>
            <option>Mobility: Wheelchair</option>
            <option>Mobility: Companion Required</option>
            <option>Mobility: Service Animal</option>
          </Select>
          <Input placeholder="Plan manager email" />
          <Textarea className="md:col-span-3" placeholder="Care notes, triggers, support details" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Add Client</Button>
          <Button variant="outline">Save Draft Profile</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Client List</h2>
        <p className="mt-1 text-xs text-slate-500">Riders you have created bookings for</p>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : clients.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No clients yet. Create a booking for a rider from the Bookings page to add them here.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">NDIS ID</th>
                  <th className="py-2 pr-3">Bookings</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2 pr-3">{c.full_name || c.email}</td>
                    <td className="py-2 pr-3">{c.email}</td>
                    <td className="py-2 pr-3">{c.ndis_id || "—"}</td>
                    <td className="py-2 pr-3">{c.bookings_count ?? "0"}</td>
                    <td className="py-2 pr-3"><Badge tone="certified">Active</Badge></td>
                    <td className="py-2">
                      <Link href="/agent/bookings">
                        <Button variant="outline">View Bookings</Button>
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
