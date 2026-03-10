"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Rider = {
  id: string;
  email: string;
  is_active?: boolean;
  full_name?: string;
  phone?: string;
  ndis_id?: string;
  bookings_count?: string;
};
type Driver = {
  id: string;
  email: string;
  is_active?: boolean;
  full_name?: string;
  phone?: string;
  vehicle_rego?: string;
  verification_status?: string;
};
type Partner = {
  id: string;
  email: string;
  is_active?: boolean;
  org_name?: string;
  contact_name?: string;
  clients_count?: number;
};
type SupportTicket = {
  id: string;
  role: "rider" | "driver" | "partner" | "admin";
  issue_type: string;
  reference_id?: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  message: string;
  status: "open" | "in_review" | "resolved" | "closed";
  created_at: string;
  created_by?: string;
  created_by_email?: string;
};
type PartnerClient = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  ndis_id?: string;
  notes?: string;
  created_at?: string;
};
type PartnerRelationshipsResponse = {
  partnerClients: PartnerClient[];
  riderPartners: Array<{
    id: string;
    email: string;
    org_name?: string;
    contact_name?: string;
    notes?: string;
    created_at?: string;
  }>;
};

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"rider" | "driver" | "partner">("rider");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [ndisId, setNdisId] = useState("");
  const [vehicleRego, setVehicleRego] = useState("");
  const [orgName, setOrgName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const session = getAuthSession();
    if (!session?.accessToken || !email || !password) return;
    setLoading(true);
    setMsg("");
    try {
      await apiJson("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          role,
          fullName: fullName || undefined,
          phone: phone || undefined,
          ndisId: role === "rider" ? ndisId || undefined : undefined,
          vehicleRego: role === "driver" ? vehicleRego || undefined : undefined,
          orgName: role === "partner" ? orgName || undefined : undefined,
        }),
      }, session.accessToken);
      setMsg("User created.");
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setNdisId("");
      setVehicleRego("");
      setOrgName("");
      onCreated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="rider">Rider</option>
          <option value="driver">Driver</option>
          <option value="partner">Partner</option>
        </Select>
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {role === "rider" && <Input placeholder="NDIS ID" value={ndisId} onChange={(e) => setNdisId(e.target.value)} />}
        {role === "driver" && <Input placeholder="Vehicle rego" value={vehicleRego} onChange={(e) => setVehicleRego(e.target.value)} />}
        {role === "partner" && <Input placeholder="Org name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />}
      </div>
      <div className="flex gap-2">
        <Button disabled={loading || !email || !password} onClick={submit}>
          {loading ? "Creating..." : "Create User"}
        </Button>
        {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
      </div>
    </div>
  );
}

export default function AdminCrmPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryRole, setDirectoryRole] = useState<"all" | "rider" | "driver" | "partner">("all");
  const [directoryStatus, setDirectoryStatus] = useState<"all" | "active" | "inactive">("all");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "open" | "in_review" | "resolved" | "closed">("open");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [partnerClients, setPartnerClients] = useState<PartnerClient[]>([]);
  const [relationshipLoading, setRelationshipLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const session = getAuthSession();

  async function fetchAll(token: string) {
    setLoading(true);
    setMsg("");
    try {
      const [ridersRes, driversRes, partnersRes, ticketsRes] = await Promise.all([
        apiJson<{ items: Rider[] }>("/admin/riders", undefined, token),
        apiJson<{ items: Driver[] }>("/admin/drivers", undefined, token),
        apiJson<{ items: Partner[] }>("/admin/partners", undefined, token),
        apiJson<{ items: SupportTicket[] }>("/admin/support-tickets", undefined, token),
      ]);
      setRiders(ridersRes.items);
      setDrivers(driversRes.items);
      setPartners(partnersRes.items);
      setTickets(ticketsRes.items);
      if (!selectedPartnerId && partnersRes.items[0]?.id) {
        setSelectedPartnerId(partnersRes.items[0].id);
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Failed to load CRM data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session?.accessToken) return;
    fetchAll(session.accessToken).catch(() => undefined);
    // Deliberately scoped to token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token || !selectedPartnerId) {
      setPartnerClients([]);
      return;
    }
    setRelationshipLoading(true);
    apiJson<PartnerRelationshipsResponse>(`/admin/users/${selectedPartnerId}/relationships`, undefined, token)
      .then((res) => {
        setPartnerClients(res.partnerClients ?? []);
      })
      .catch(() => {
        setPartnerClients([]);
      })
      .finally(() => setRelationshipLoading(false));
  }, [session?.accessToken, selectedPartnerId]);

  const contacts = useMemo(() => {
    return [
      ...riders.map((r) => ({
        id: r.id,
        name: r.full_name || r.email,
        type: "rider" as const,
        email: r.email,
        isActive: Boolean(r.is_active),
      })),
      ...drivers.map((d) => ({
        id: d.id,
        name: d.full_name || d.email,
        type: "driver" as const,
        email: d.email,
        isActive: Boolean(d.is_active),
      })),
      ...partners.map((p) => ({
        id: p.id,
        name: p.contact_name || p.org_name || p.email,
        type: "partner" as const,
        email: p.email,
        isActive: Boolean(p.is_active),
      })),
    ];
  }, [drivers, partners, riders]);

  const filteredContacts = useMemo(() => {
    const needle = directorySearch.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (directoryRole !== "all" && contact.type !== directoryRole) return false;
      if (directoryStatus === "active" && !contact.isActive) return false;
      if (directoryStatus === "inactive" && contact.isActive) return false;
      if (!needle) return true;
      return [contact.name, contact.email, contact.type].some((value) => value.toLowerCase().includes(needle));
    });
  }, [contacts, directoryRole, directorySearch, directoryStatus]);

  const filteredTickets = useMemo(() => {
    if (ticketStatusFilter === "all") return tickets;
    return tickets.filter((ticket) => ticket.status === ticketStatusFilter);
  }, [ticketStatusFilter, tickets]);

  const availableRiders = useMemo(() => {
    const assigned = new Set(partnerClients.map((client) => client.id));
    return riders.filter((r) => !assigned.has(r.id));
  }, [partnerClients, riders]);

  async function assignClientToPartner() {
    const token = session?.accessToken;
    if (!token || !selectedPartnerId || !selectedRiderId) return;
    setMsg("");
    try {
      await apiJson(`/admin/partners/${selectedPartnerId}/clients`, {
        method: "POST",
        body: JSON.stringify({ riderId: selectedRiderId, notes: assignNotes || undefined }),
      }, token);
      setSelectedRiderId("");
      setAssignNotes("");
      const res = await apiJson<PartnerRelationshipsResponse>(`/admin/users/${selectedPartnerId}/relationships`, undefined, token);
      setPartnerClients(res.partnerClients ?? []);
      await fetchAll(token);
      setMsg("Client linked to partner.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Failed to assign client.");
    }
  }

  async function removeClientFromPartner(riderId: string) {
    const token = session?.accessToken;
    if (!token || !selectedPartnerId) return;
    setMsg("");
    try {
      await apiJson(`/admin/partners/${selectedPartnerId}/clients/${riderId}`, { method: "DELETE" }, token);
      const res = await apiJson<PartnerRelationshipsResponse>(`/admin/users/${selectedPartnerId}/relationships`, undefined, token);
      setPartnerClients(res.partnerClients ?? []);
      await fetchAll(token);
      setMsg("Client removed from partner.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Failed to remove client.");
    }
  }

  async function updateTicketStatus(id: string, status: SupportTicket["status"]) {
    const token = session?.accessToken;
    if (!token) return;
    try {
      await apiJson(`/admin/support-tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
    } catch {
      setMsg("Failed to update ticket status.");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">CRM & Relationship Management</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Unified relationship layer for riders, carers, plan managers, drivers, and partner organizations.
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        <Card>
          <p className="text-xs text-slate-500">Riders</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{riders.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Drivers</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{drivers.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Partners</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{partners.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Partner Clients Linked</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">
            {partners.reduce((sum, partner) => sum + Number(partner.clients_count ?? 0), 0)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Open Tickets</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{tickets.filter((t) => t.status === "open").length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create User (Rider / Driver / Partner)</h2>
        <p className="mt-1 text-xs text-slate-600">Creates a new platform user. They can then login from their portal.</p>
        <CreateUserForm onCreated={() => {
          if (!session?.accessToken) return;
          fetchAll(session.accessToken).catch(() => undefined);
        }} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Contact Directory</h2>
        <p className="mt-1 text-xs text-slate-500">Search, filter, and open customer records across riders, drivers, and partners.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search name/email/role"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
          />
          <Select value={directoryRole} onChange={(e) => setDirectoryRole(e.target.value as typeof directoryRole)}>
            <option value="all">All Roles</option>
            <option value="rider">Riders</option>
            <option value="driver">Drivers</option>
            <option value="partner">Partners</option>
          </Select>
          <Select value={directoryStatus} onChange={(e) => setDirectoryStatus(e.target.value as typeof directoryStatus)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button variant="outline" onClick={() => {
            setDirectorySearch("");
            setDirectoryRole("all");
            setDirectoryStatus("all");
          }}>
            Clear Filters
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : filteredContacts.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No contacts match the current filters.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={`${contact.type}-${contact.id}`} className="border-b">
                    <td className="py-2 pr-4">{contact.name}</td>
                    <td className="py-2 pr-4">
                      <span className="capitalize">{contact.type}</span>
                    </td>
                    <td className="py-2 pr-4">{contact.email}</td>
                    <td className="py-2 pr-4">
                      <Badge tone={contact.isActive ? "certified" : "pending"}>
                        {contact.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/users/${contact.id}`}>
                          <Button variant="outline">Open Record</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Partner-Client Ownership Manager</h2>
        <p className="mt-1 text-xs text-slate-600">Assign riders to partners and maintain scoped ownership from one control panel.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Select value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)}>
            <option value="">Select partner</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {(partner.contact_name || partner.org_name || partner.email) + ` (${partner.clients_count ?? 0} clients)`}
              </option>
            ))}
          </Select>
          <Select value={selectedRiderId} onChange={(e) => setSelectedRiderId(e.target.value)}>
            <option value="">Select available rider</option>
            {availableRiders.map((rider) => (
              <option key={rider.id} value={rider.id}>
                {rider.full_name || rider.email}
              </option>
            ))}
          </Select>
          <Textarea
            placeholder="Assignment notes (optional)"
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
          />
          <Button disabled={!selectedPartnerId || !selectedRiderId} onClick={assignClientToPartner}>
            Assign Client
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          {!selectedPartnerId ? (
            <p className="text-sm text-slate-500">Pick a partner to manage ownership links.</p>
          ) : relationshipLoading ? (
            <p className="text-sm text-slate-500">Loading partner clients...</p>
          ) : partnerClients.length === 0 ? (
            <p className="text-sm text-slate-500">No clients assigned to this partner yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">NDIS</th>
                  <th className="py-2 pr-3">Notes</th>
                  <th className="py-2 pr-3">Linked</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partnerClients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="py-2 pr-3">{client.full_name || client.email}</td>
                    <td className="py-2 pr-3">{client.email}</td>
                    <td className="py-2 pr-3">{client.ndis_id || "-"}</td>
                    <td className="py-2 pr-3">{client.notes || "-"}</td>
                    <td className="py-2 pr-3">{client.created_at ? new Date(client.created_at).toLocaleDateString() : "-"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Link href={`/admin/users/${client.id}`}>
                          <Button variant="outline">Open</Button>
                        </Link>
                        <Button variant="outline" onClick={() => removeClientFromPartner(client.id)}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">CRM Ticket Inbox</h2>
        <p className="mt-1 text-xs text-slate-600">Track and triage support requests raised by riders, drivers, and partners.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Select value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value as typeof ticketStatusFilter)}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
        <div className="mt-4 overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <p className="text-sm text-slate-500">No support tickets for this status.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">From</th>
                  <th className="py-2 pr-3">Issue</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Message</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b align-top">
                    <td className="py-2 pr-3 text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      <div className="capitalize">{ticket.role}</div>
                      {ticket.created_by ? (
                        <Link href={`/admin/users/${ticket.created_by}`} className="text-xs text-[var(--color-primary)] hover:underline">
                          {ticket.created_by_email || ticket.created_by}
                        </Link>
                      ) : (
                        <div className="text-xs text-slate-500">{ticket.created_by_email || "-"}</div>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <div>{ticket.issue_type}</div>
                      <div className="text-xs text-slate-500">{ticket.reference_id || "-"}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge tone={ticket.priority === "urgent" || ticket.priority === "high" ? "danger" : "default"}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-slate-700">{ticket.message}</td>
                    <td className="py-2 pr-3">
                      <Select
                        value={ticket.status}
                        onChange={(e) => updateTicketStatus(ticket.id, e.target.value as SupportTicket["status"])}
                      >
                        <option value="open">open</option>
                        <option value="in_review">in_review</option>
                        <option value="resolved">resolved</option>
                        <option value="closed">closed</option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
    </div>
  );
}
