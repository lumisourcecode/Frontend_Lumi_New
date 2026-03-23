"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type PartnerOverview = {
  id: string;
  email: string;
  is_active: boolean;
  created_at?: string;
  org_name?: string;
  contact_name?: string;
};
type PartnerStats = {
  clientsCount: number;
  bookingsCount: number;
  plansCount: number;
  ticketsCount: number;
};
type PartnerClient = {
  id: string;
  email: string;
  full_name?: string;
  ndis_id?: string;
  notes?: string;
  created_at?: string;
};
type Rider = { id: string; email: string; full_name?: string };
type Booking = {
  id: string;
  rider_email?: string;
  rider_name?: string;
  pickup: string;
  dropoff: string;
  scheduled_at: string;
  status: string;
  created_at: string;
};
type Plan = {
  id: string;
  name: string;
  status: string;
  frequency?: string;
  target_group?: string;
  priority?: string;
  notes?: string;
};
type Ticket = {
  id: string;
  issue_type: string;
  reference_id?: string;
  priority: string;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminPartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = getAuthSession();
  const token = session?.accessToken;

  const [tab, setTab] = useState<"overview" | "clients" | "bookings" | "plans" | "tickets">("overview");
  const [overview, setOverview] = useState<PartnerOverview | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allRiders, setAllRiders] = useState<Rider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanStatus, setNewPlanStatus] = useState("Draft");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOverview() {
    if (!token || !id) return;
    const [overviewRes, relationsRes, ridersRes] = await Promise.all([
      apiJson<{ partner: PartnerOverview; stats: PartnerStats }>(`/admin/partners/${id}/overview`, undefined, token),
      apiJson<{ partnerClients: PartnerClient[] }>(`/admin/users/${id}/relationships`, undefined, token),
      apiJson<{ items: Rider[] }>("/admin/riders", undefined, token),
    ]);
    setOverview(overviewRes.partner);
    setStats(overviewRes.stats);
    setClients(relationsRes.partnerClients ?? []);
    setAllRiders(ridersRes.items ?? []);
    setOrgName(overviewRes.partner.org_name ?? "");
    setContactName(overviewRes.partner.contact_name ?? "");
    setIsActive(Boolean(overviewRes.partner.is_active));
  }

  async function loadTabData() {
    if (!token || !id) return;
    if (tab === "bookings") {
      const res = await apiJson<{ items: Booking[] }>(`/admin/partners/${id}/bookings`, undefined, token);
      setBookings(res.items ?? []);
    } else if (tab === "plans") {
      const res = await apiJson<{ items: Plan[] }>(`/admin/partners/${id}/plans`, undefined, token);
      setPlans(res.items ?? []);
    } else if (tab === "tickets") {
      const res = await apiJson<{ items: Ticket[] }>(`/admin/partners/${id}/support-tickets`, undefined, token);
      setTickets(res.items ?? []);
    }
  }

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    loadOverview()
      .catch((error) => setMsg(error instanceof Error ? error.message : "Failed to load partner"))
      .finally(() => setLoading(false));
    // Deliberately tied to route and token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  useEffect(() => {
    loadTabData().catch(() => undefined);
    // Deliberately tied to tab changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, token, id]);

  const availableRiders = useMemo(() => {
    const assigned = new Set(clients.map((client) => client.id));
    return allRiders.filter((rider) => !assigned.has(rider.id));
  }, [allRiders, clients]);

  async function savePartner() {
    if (!token || !id) return;
    setMsg("");
    try {
      await apiJson(`/admin/partners/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ orgName, contactName, isActive }),
      }, token);
      await loadOverview();
      setMsg("Partner profile updated.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Update failed.");
    }
  }

  async function addClient() {
    if (!token || !id || !selectedRiderId) return;
    setMsg("");
    try {
      await apiJson(`/admin/partners/${id}/clients`, {
        method: "POST",
        body: JSON.stringify({ riderId: selectedRiderId, notes: clientNotes || undefined }),
      }, token);
      setSelectedRiderId("");
      setClientNotes("");
      await loadOverview();
      setMsg("Client assigned.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not assign client.");
    }
  }

  async function removeClient(riderId: string) {
    if (!token || !id) return;
    setMsg("");
    try {
      await apiJson(`/admin/partners/${id}/clients/${riderId}`, { method: "DELETE" }, token);
      await loadOverview();
      setMsg("Client removed.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not remove client.");
    }
  }

  async function createPlan() {
    if (!token || !id || !newPlanName.trim()) return;
    setMsg("");
    try {
      await apiJson(`/admin/partners/${id}/plans`, {
        method: "POST",
        body: JSON.stringify({ name: newPlanName.trim(), status: newPlanStatus }),
      }, token);
      setNewPlanName("");
      await loadOverview();
      await loadTabData();
      setMsg("Plan created.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not create plan.");
    }
  }

  async function updatePlanStatus(planId: string, status: string) {
    if (!token || !id) return;
    await apiJson(`/admin/partners/${id}/plans/${planId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token);
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, status } : p)));
  }

  async function deletePlan(planId: string) {
    if (!token || !id) return;
    await apiJson(`/admin/partners/${id}/plans/${planId}`, { method: "DELETE" }, token);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    await loadOverview();
  }

  async function updateTicketStatus(ticketId: string, status: string) {
    if (!token) return;
    setMsg("");
    try {
      await apiJson(`/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
      setMsg("Ticket status updated.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not update ticket.");
    }
  }

  async function updateBookingStatus(bookingId: string, status: "pending_matching" | "confirmed" | "cancelled") {
    if (!token) return;
    setMsg("");
    try {
      await apiJson(`/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      setMsg("Booking updated.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not update booking.");
    }
  }

  async function removeBooking(bookingId: string) {
    if (!token) return;
    setMsg("");
    try {
      await apiJson(`/admin/bookings/${bookingId}`, { method: "DELETE" }, token);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setMsg("Booking removed.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not remove booking.");
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading partner workspace...</div>;
  if (!overview) return <div className="text-sm text-red-600">Partner not found.</div>;

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-[var(--color-primary)] text-white">
        <div>
          <h1 className="text-2xl font-bold">Partner Workspace</h1>
          <p className="mt-1 text-sm text-indigo-100">{overview.contact_name || overview.org_name || overview.email}</p>
          <p className="text-xs text-indigo-100">{overview.email}</p>
        </div>
        <Link href={`/admin/users/${overview.id}`}>
          <Button className="bg-white text-[var(--color-primary)] hover:bg-slate-100">Open User Profile</Button>
        </Link>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Clients</p><p className="text-2xl font-bold">{stats?.clientsCount ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Bookings</p><p className="text-2xl font-bold">{stats?.bookingsCount ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Plans</p><p className="text-2xl font-bold">{stats?.plansCount ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Tickets</p><p className="text-2xl font-bold">{stats?.ticketsCount ?? 0}</p></Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {(["overview", "clients", "bookings", "plans", "tickets"] as const).map((key) => (
            <Button key={key} variant={tab === key ? "primary" : "outline"} onClick={() => setTab(key)}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      {tab === "overview" && (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Profile Controls</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Organisation name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <Input placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <Select value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={savePartner}>Save Changes</Button>
            <Badge tone={overview.is_active ? "certified" : "pending"}>{overview.is_active ? "Active" : "Inactive"}</Badge>
          </div>
        </Card>
      )}

      {tab === "clients" && (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Partner Clients</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={selectedRiderId} onChange={(e) => setSelectedRiderId(e.target.value)}>
              <option value="">Select rider to assign</option>
              {availableRiders.map((rider) => (
                <option key={rider.id} value={rider.id}>{rider.full_name || rider.email}</option>
              ))}
            </Select>
            <Textarea placeholder="Assignment notes" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} />
            <Button disabled={!selectedRiderId} onClick={addClient}>Assign Rider</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">NDIS</th>
                  <th className="py-2 pr-3">Notes</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="py-2 pr-3">{client.full_name || client.email}</td>
                    <td className="py-2 pr-3">{client.email}</td>
                    <td className="py-2 pr-3">{client.ndis_id || "-"}</td>
                    <td className="py-2 pr-3">{client.notes || "-"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Link href={`/admin/users/${client.id}`}><Button variant="outline">Open</Button></Link>
                        <Button variant="outline" onClick={() => removeClient(client.id)}>Remove</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "bookings" && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Partner Bookings</h2>
          <div className="mt-3 max-w-xs">
            <Select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="pending_matching">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Scheduled</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .filter((b) => bookingStatusFilter === "all" || b.status === bookingStatusFilter)
                  .map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 pr-3">{b.rider_name || b.rider_email || "-"}</td>
                    <td className="py-2 pr-3">{b.pickup} {"->"} {b.dropoff}</td>
                    <td className="py-2 pr-3">{new Date(b.scheduled_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">{b.status}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => updateBookingStatus(b.id, "pending_matching")}>Pending</Button>
                        <Button variant="outline" onClick={() => updateBookingStatus(b.id, "confirmed")}>Confirm</Button>
                        <Button variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")}>Cancel</Button>
                        <Button variant="danger" onClick={() => removeBooking(b.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "plans" && (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Travel Plans</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="New plan name" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} />
            <Select value={newPlanStatus} onChange={(e) => setNewPlanStatus(e.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </Select>
            <Button disabled={!newPlanName.trim()} onClick={createPlan}>Create Plan</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Frequency</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b">
                    <td className="py-2 pr-3">{plan.name}</td>
                    <td className="py-2 pr-3">
                      <Select value={plan.status} onChange={(e) => updatePlanStatus(plan.id, e.target.value)}>
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                      </Select>
                    </td>
                    <td className="py-2 pr-3">{plan.frequency || "-"}</td>
                    <td className="py-2">
                      <Button variant="outline" onClick={() => deletePlan(plan.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "tickets" && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Support Tickets</h2>
          <div className="mt-3 max-w-xs">
            <Select value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="Open">Open</option>
              <option value="in_review">In review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">Issue</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Message</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets
                  .filter((t) => ticketStatusFilter === "all" || String(t.status).toLowerCase() === ticketStatusFilter.toLowerCase())
                  .map((ticket) => (
                  <tr key={ticket.id} className="border-b">
                    <td className="py-2 pr-3">{new Date(ticket.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">{ticket.issue_type}</td>
                    <td className="py-2 pr-3">{ticket.priority}</td>
                    <td className="py-2 pr-3">{ticket.status}</td>
                    <td className="py-2 pr-3">{ticket.message}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => updateTicketStatus(ticket.id, "Open")}>Open</Button>
                        <Button variant="outline" onClick={() => updateTicketStatus(ticket.id, "in_review")}>Review</Button>
                        <Button variant="outline" onClick={() => updateTicketStatus(ticket.id, "resolved")}>Resolve</Button>
                        <Button variant="outline" onClick={() => updateTicketStatus(ticket.id, "closed")}>Close</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
    </div>
  );
}
