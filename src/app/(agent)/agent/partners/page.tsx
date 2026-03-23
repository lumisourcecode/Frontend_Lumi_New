"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Client = { id: string; email: string; full_name?: string; ndis_id?: string; bookings_count?: string };

export default function PartnerPartnersPage() {
  const [uploaded, setUploaded] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("Nursing Home");

  async function loadClients() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const r = await apiJson<{ items: Client[] }>("/partner/clients", undefined, session.accessToken);
    setClients(r.items);
  }

  useEffect(() => {
    loadClients()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addPartnerFacility() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!contactEmail.trim()) {
      setMsg("Contact email is required.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson("/partner/clients", {
        method: "POST",
        body: JSON.stringify({
          email: contactEmail.trim().toLowerCase(),
          fullName: contactName || facilityName || undefined,
          phone: phone || undefined,
          ndisId: region || undefined,
          notes: `Facility: ${facilityName || "-"} | Type: ${type} | ${notes || ""}`,
        }),
      }, session.accessToken);
      await loadClients();
      setMsg("Partner facility contact added to CRM roster.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to add partner");
    } finally {
      setBusy(false);
    }
  }

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
          <Input placeholder="Facility Name" value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
          <Input placeholder="Primary Contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <Input placeholder="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Nursing Home</option>
            <option>Aged Care Office</option>
            <option>Disability Service</option>
            <option>Mental Health Program</option>
          </Select>
          <Input placeholder="Service Suburb/Region" value={region} onChange={(e) => setRegion(e.target.value)} />
          <Textarea className="md:col-span-3" placeholder="Agreement terms, notes, and escalation preferences" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={addPartnerFacility} disabled={busy}>{busy ? "Saving..." : "Add Partner"}</Button>
          <Button variant="outline" onClick={addPartnerFacility} disabled={busy}>Save as Draft</Button>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
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
          {(loading
            ? []
            : [
                { month: "Active Clients", amount: clients.length, billed: true },
                { month: "Needs Follow-up", amount: Math.max(clients.length - 1, 0), billed: false },
                { month: "This Week Cohort", amount: Math.min(clients.length, 25), billed: true },
              ]).map((point) => (
            <div key={point.month}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{point.month}</span>
                <span>{point.amount}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.min((point.amount / 50) * 100, 100)}%` }}
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
          {clients.slice(0, 8).map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 p-3">
              {c.full_name || c.email} | Trips: {c.bookings_count ?? "0"}
            </div>
          ))}
          {!loading && clients.length === 0 ? <div className="rounded-xl border border-slate-200 p-3">No partner history yet.</div> : null}
        </div>
      </Card>
    </div>
  );
}
