"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Client = { id: string; email: string; full_name?: string; phone?: string; ndis_id?: string; bookings_count?: string; notes?: string };

export default function PartnerClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    ndisId: "",
    notes: "",
  });

  async function loadClients() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const r = await apiJson<{ items: Client[] }>("/partner/clients", undefined, session.accessToken);
    setClients(r.items);
  }

  useEffect(() => {
    loadClients()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function createClient() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!form.email.trim()) {
      setMsg("Email is required");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson("/partner/clients", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          ndisId: form.ndisId || undefined,
          notes: form.notes || undefined,
        }),
      }, session.accessToken);
      await loadClients();
      setForm({ email: "", fullName: "", phone: "", ndisId: "", notes: "" });
      setMsg("Client added.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to add client");
    } finally {
      setBusy(false);
    }
  }

  async function updateClient(clientId: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/partner/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          ndisId: form.ndisId || undefined,
          notes: form.notes || undefined,
        }),
      }, session.accessToken);
      await loadClients();
      setEditingId(null);
      setMsg("Client updated.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to update client");
    } finally {
      setBusy(false);
    }
  }

  async function removeClient(clientId: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/partner/clients/${clientId}`, { method: "DELETE" }, session.accessToken);
      await loadClients();
      setMsg("Client removed.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to remove client");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      email: client.email,
      fullName: client.full_name || "",
      phone: client.phone || "",
      ndisId: client.ndis_id || "",
      notes: client.notes || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ email: "", fullName: "", phone: "", ndisId: "", notes: "" });
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#16206C] to-[#2A8CBC] text-white">
        <h1 className="text-2xl font-bold">Client Registry</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Add and manage residents/patients with full transport, support, and billing profiles.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">{editingId ? "Edit Client" : "Add New Client"}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Client email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            disabled={!!editingId}
          />
          <Input placeholder="Client full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <Input placeholder="NDIS / Facility ID" value={form.ndisId} onChange={(e) => setForm((p) => ({ ...p, ndisId: e.target.value }))} />
          <Input placeholder="Primary contact phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input placeholder="Emergency contact (optional text)" />
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
          <Textarea
            className="md:col-span-3"
            placeholder="Care notes, triggers, support details"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {editingId ? (
            <>
              <Button onClick={() => updateClient(editingId)} disabled={busy}>Save Changes</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={createClient} disabled={busy}>Add Client</Button>
              <Button variant="outline">Save Draft Profile</Button>
            </>
          )}
        </div>
        {msg ? <p className="mt-3 text-sm text-slate-600">{msg}</p> : null}
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
                    <td className="py-2 pr-3">
                      <Link href={`/admin/users/${c.id}`} className="font-medium text-[var(--color-primary)] hover:underline">
                        {c.full_name || c.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/users/${c.id}`} className="text-[var(--color-primary)] hover:underline">
                        {c.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{c.ndis_id || "—"}</td>
                    <td className="py-2 pr-3">{c.bookings_count ?? "0"}</td>
                    <td className="py-2 pr-3"><Badge tone="certified">Active</Badge></td>
                    <td className="py-2">
                      <Link href="/partner/bookings">
                        <Button variant="outline">View Bookings</Button>
                      </Link>
                      <Button variant="outline" onClick={() => startEdit(c)}>Edit</Button>
                      <Button variant="danger" onClick={() => removeClient(c.id)} disabled={busy}>Remove</Button>
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
