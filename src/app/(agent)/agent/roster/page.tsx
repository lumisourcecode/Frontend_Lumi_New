"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Client = { id: string; email: string; full_name?: string; phone?: string; ndis_id?: string; bookings_count?: string };

export default function PartnerRosterPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Client[] }>("/partner/clients", undefined, session.accessToken)
      .then((r) => setClients(r.items))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#152168] to-[#2F90BE] text-white">
        <h1 className="text-2xl font-bold">Roster & Coordination</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Plan daily and weekly transport rosters for facilities, carers, and client groups.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Roster Block</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input type="date" />
          <Select>
            <option>Morning Window</option>
            <option>Afternoon Window</option>
            <option>Evening Window</option>
          </Select>
          <Select>
            <option>Facility: Lakeside Nursing Home</option>
            <option>Facility: North Mental Health Outreach</option>
          </Select>
          <Input placeholder="Expected clients count" />
          <Input placeholder="Pickup zone" />
          <Input placeholder="Drop-off zone" />
          <Textarea className="md:col-span-3" placeholder="Coordination notes for drivers and carers" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Roster Block</Button>
          <Button variant="outline">Assign Preferred Drivers</Button>
          <Button variant="outline">Save as Weekly Template</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Client Roster</h2>
        <p className="mt-1 text-xs text-slate-500">Clients you have created bookings for</p>
        <div className="mt-3 space-y-2 text-sm">
          {clients.length === 0 ? (
            <p className="text-slate-500">No clients yet. Create bookings from the Bookings page.</p>
          ) : (
            clients.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="font-medium">{c.full_name || c.email}</span>
                <span className="text-slate-500">{c.bookings_count ?? "0"} bookings</span>
                <Link href="/partner/bookings"><Button variant="outline" size="sm">Book</Button></Link>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
