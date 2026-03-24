"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { PasswordStrength, getPasswordStrength } from "@/components/auth/password-strength";

type UserDetail = {
  user: { id: string; email: string; is_active: boolean; is_super_admin?: boolean; roles: string[]; created_at: string };
  riderProfile: {
    full_name: string;
    phone: string;
    ndis_id: string;
    plan_manager_email?: string | null;
    address_line1?: string | null;
    suburb?: string | null;
    state?: string | null;
    postcode?: string | null;
  } | null;
  driverProfile: { full_name: string; phone: string; vehicle_rego: string; verification_status: string } | null;
  partnerProfile: { org_name: string; contact_name: string } | null;
  adminProfile: { display_name: string } | null;
  bookingsCount: number;
  partnerClientsCount: number;
  tripsCount?: number;
  supportTicketsCount?: number;
};

type AdminDocument = { id: string; doc_type: string; status: string; expiry?: string; admin_notes?: string };
type PartnerLite = { id: string; email: string; contact_name?: string; org_name?: string };
type RiderLite = { id: string; email: string; full_name?: string };

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<UserDetail | null>(null);
  const [tab, setTab] = useState<"overview" | "documents" | "history" | "activity" | "relations" | "support">("overview");
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [history, setHistory] = useState<{ bookings: Array<Record<string, unknown>>; trips: Array<Record<string, unknown>> }>({ bookings: [], trips: [] });
  const [activity, setActivity] = useState<Array<Record<string, unknown>>>([]);
  const [relations, setRelations] = useState<{ partnerClients: Array<Record<string, unknown>>; riderPartners: Array<Record<string, unknown>> }>({ partnerClients: [], riderPartners: [] });
  const [supportTickets, setSupportTickets] = useState<Array<Record<string, unknown>>>([]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [partners, setPartners] = useState<PartnerLite[]>([]);
  const [riders, setRiders] = useState<RiderLite[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [relationNotes, setRelationNotes] = useState("");
  const [historyType, setHistoryType] = useState<"all" | "booking" | "trip" | "activity" | "document" | "relation">("all");
  const [docDrafts, setDocDrafts] = useState<Record<string, { status: string; admin_notes: string }>>({});
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<"rider" | "driver" | "partner" | "admin" | false>(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [timelineLimit, setTimelineLimit] = useState(120);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    ndisId: "",
    planManagerEmail: "",
    addressLine1: "",
    suburb: "",
    addressState: "",
    postcode: "",
    vehicleRego: "",
    orgName: "",
    contactName: "",
    displayName: "",
  });
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const session = getAuthSession();

  async function reloadMain() {
    if (!session?.accessToken) return;
    const d = await apiJson<UserDetail>(`/admin/users/${id}`, undefined, session.accessToken);
    setData(d);
    const r = d.riderProfile;
    const dr = d.driverProfile;
    const p = d.partnerProfile;
    const ad = d.adminProfile;
    setForm({
      fullName: r?.full_name || dr?.full_name || p?.contact_name || ad?.display_name || "",
      phone: r?.phone || dr?.phone || "",
      ndisId: r?.ndis_id || "",
      planManagerEmail: r?.plan_manager_email ?? "",
      addressLine1: r?.address_line1 ?? "",
      suburb: r?.suburb ?? "",
      addressState: r?.state ?? "",
      postcode: r?.postcode ?? "",
      vehicleRego: dr?.vehicle_rego || "",
      orgName: p?.org_name || "",
      contactName: p?.contact_name || "",
      displayName: ad?.display_name || "",
    });
  }

  useEffect(() => {
    if (!session?.accessToken) {
      setError("Please login as admin.");
      return;
    }
    reloadMain()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    if (tab === "documents") {
      apiJson<{ items: Array<{ id: string; doc_type: string; status: string; expiry?: string }> }>(
        `/admin/users/${id}/documents`,
        undefined,
        session.accessToken,
      ).then((r) => {
        const items = (r.items as AdminDocument[]) ?? [];
        setDocuments(items);
        setDocDrafts(
          Object.fromEntries(
            items.map((doc) => [doc.id, { status: doc.status, admin_notes: doc.admin_notes ?? "" }]),
          ),
        );
      }).catch(() => {
        setDocuments([]);
        setDocDrafts({});
      });
    }
    if (tab === "history") {
      Promise.all([
        apiJson<{ bookings: Array<Record<string, unknown>>; trips: Array<Record<string, unknown>> }>(
          `/admin/users/${id}/history`,
          undefined,
          session.accessToken,
        ),
        apiJson<{ items: AdminDocument[] }>(`/admin/users/${id}/documents`, undefined, session.accessToken),
        apiJson<{ items: Array<Record<string, unknown>> }>(`/admin/users/${id}/activity`, undefined, session.accessToken),
        apiJson<{ partnerClients: Array<Record<string, unknown>>; riderPartners: Array<Record<string, unknown>> }>(
          `/admin/users/${id}/relationships`,
          undefined,
          session.accessToken,
        ),
      ])
        .then(([h, d, a, r]) => {
          setHistory(h);
          setDocuments(d.items ?? []);
          setActivity(a.items ?? []);
          setRelations(r);
        })
        .catch(() => {
          setHistory({ bookings: [], trips: [] });
        });
    }
    if (tab === "activity") {
      apiJson<{ items: Array<Record<string, unknown>> }>(
        `/admin/users/${id}/activity`,
        undefined,
        session.accessToken,
      ).then((r) => setActivity(r.items)).catch(() => setActivity([]));
    }
    if (tab === "relations") {
      apiJson<{ partnerClients: Array<Record<string, unknown>>; riderPartners: Array<Record<string, unknown>> }>(
        `/admin/users/${id}/relationships`,
        undefined,
        session.accessToken,
      ).then(setRelations).catch(() => setRelations({ partnerClients: [], riderPartners: [] }));
      apiJson<{ items: PartnerLite[] }>(`/admin/partners`, undefined, session.accessToken)
        .then((r) => setPartners(r.items))
        .catch(() => setPartners([]));
      apiJson<{ items: RiderLite[] }>(`/admin/riders`, undefined, session.accessToken)
        .then((r) => setRiders(r.items))
        .catch(() => setRiders([]));
    }
    if (tab === "support") {
      const qs = ticketStatusFilter ? `?status=${encodeURIComponent(ticketStatusFilter)}` : "";
      apiJson<{ items: Array<Record<string, unknown>> }>(`/admin/users/${id}/support-tickets${qs}`, undefined, session.accessToken)
        .then((r) => setSupportTickets(r.items ?? []))
        .catch(() => setSupportTickets([]));
    }
  }, [tab, id, session?.accessToken, ticketStatusFilter]);

  async function saveProfile() {
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/users/${id}/profile`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          ndisId: form.ndisId || undefined,
          planManagerEmail: form.planManagerEmail,
          addressLine1: form.addressLine1,
          suburb: form.suburb,
          addressState: form.addressState,
          postcode: form.postcode,
          vehicleRego: form.vehicleRego || undefined,
          orgName: form.orgName || undefined,
          contactName: form.contactName || undefined,
          displayName: form.displayName || undefined,
        }),
      }, session.accessToken);
      setMsg("Profile saved.");
      setEditing(false as const);
      await reloadMain();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!session?.accessToken) return;
    const { score } = getPasswordStrength(newPassword);
    if (score < 3 || newPassword.length < 8) {
      setMsg("Use a stronger password (8+ chars, upper & lower, number, symbol)");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/users/${id}/change-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword, sendEmail }),
      }, session.accessToken);
      setMsg(sendEmail ? "Password updated and email sent to user." : "Password updated.");
      setChangePwOpen(false);
      setNewPassword("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    if (!session?.accessToken || !data) return;
    if (data.user.is_super_admin) return;
    setSaving(true);
    try {
      await apiJson(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !data.user.is_active }),
      }, session.accessToken);
      setData((prev) => prev ? { ...prev, user: { ...prev.user, is_active: !prev.user.is_active } } : null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    if (!session?.accessToken || !data) return;
    if (data.user.is_super_admin) {
      setMsg("Cannot delete super admin.");
      return;
    }
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/users/${id}`, { method: "DELETE" }, session.accessToken);
      window.location.href = "/admin/users";
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  }

  function exportTimelineCsv() {
    const headers = ["type", "label", "detail", "at"];
    const rows = timeline.slice(0, timelineLimit);
    const csv = [
      headers.join(","),
      ...rows.map((r) => [r.type, r.label, r.detail, r.at].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user-${id}-timeline.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function verifyDocument(docId: string) {
    if (!session?.accessToken) return;
    const draft = docDrafts[docId];
    if (!draft?.status) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/documents/${docId}/verify`, {
        method: "POST",
        body: JSON.stringify({
          status: draft.status,
          adminNotes: draft.admin_notes || undefined,
        }),
      }, session.accessToken);
      setMsg("Document updated.");
      const r = await apiJson<{ items: AdminDocument[] }>(`/admin/users/${id}/documents`, undefined, session.accessToken);
      const items = (r.items ?? []) as AdminDocument[];
      setDocuments(items);
      setDocDrafts(Object.fromEntries(items.map((doc) => [doc.id, { status: doc.status, admin_notes: doc.admin_notes ?? "" }])));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to update document");
    } finally {
      setSaving(false);
    }
  }

  async function addRelation() {
    if (!session?.accessToken || !data) return;
    const isPartner = data.user.roles.includes("partner");
    const isRider = data.user.roles.includes("rider");
    const partnerId = isPartner ? id : selectedPartnerId;
    const riderId = isPartner ? selectedRiderId : isRider ? id : "";
    if (!partnerId || !riderId) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/partners/${partnerId}/clients`, {
        method: "POST",
        body: JSON.stringify({ riderId, notes: relationNotes || undefined }),
      }, session.accessToken);
      const rel = await apiJson<{ partnerClients: Array<Record<string, unknown>>; riderPartners: Array<Record<string, unknown>> }>(
        `/admin/users/${id}/relationships`,
        undefined,
        session.accessToken,
      );
      setRelations(rel);
      await reloadMain();
      setRelationNotes("");
      setSelectedRiderId("");
      setSelectedPartnerId("");
      setMsg("Relationship added.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to add relation");
    } finally {
      setSaving(false);
    }
  }

  async function updateTicketStatus(ticketId: string, status: string) {
    if (!session?.accessToken || !status) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, session.accessToken);
      setMsg("Ticket updated.");
      const qs = ticketStatusFilter ? `?status=${encodeURIComponent(ticketStatusFilter)}` : "";
      const r = await apiJson<{ items: Array<Record<string, unknown>> }>(
        `/admin/users/${id}/support-tickets${qs}`,
        undefined,
        session.accessToken,
      );
      setSupportTickets(r.items ?? []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to update ticket");
    } finally {
      setSaving(false);
    }
  }

  async function removeRelation(partnerId: string, riderId: string) {
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/partners/${partnerId}/clients/${riderId}`, { method: "DELETE" }, session.accessToken);
      const rel = await apiJson<{ partnerClients: Array<Record<string, unknown>>; riderPartners: Array<Record<string, unknown>> }>(
        `/admin/users/${id}/relationships`,
        undefined,
        session.accessToken,
      );
      setRelations(rel);
      await reloadMain();
      setMsg("Relationship removed.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to remove relation");
    } finally {
      setSaving(false);
    }
  }

  const timeline = useMemo(() => {
    const rows: Array<{ at: string; type: "booking" | "trip" | "activity" | "document" | "relation"; label: string; detail: string }> = [];
    history.bookings.forEach((row) => {
      rows.push({
        at: String(row.created_at ?? row.scheduled_at ?? ""),
        type: "booking",
        label: `Booking ${String(row.status ?? "—")}`,
        detail: `${String(row.pickup ?? "—")} -> ${String(row.dropoff ?? "—")}`,
      });
    });
    history.trips.forEach((row) => {
      rows.push({
        at: String(row.created_at ?? row.assigned_at ?? ""),
        type: "trip",
        label: `Trip ${String(row.state ?? "—")}`,
        detail: `Booking ${String(row.booking_id ?? "—")}`,
      });
    });
    activity.forEach((row) => {
      rows.push({
        at: String(row.created_at ?? ""),
        type: "activity",
        label: String(row.action ?? "Activity"),
        detail: `${String(row.entity_type ?? "")} ${String(row.entity_id ?? "")}`.trim(),
      });
    });
    documents.forEach((doc) => {
      rows.push({
        at: String(doc.expiry ?? ""),
        type: "document",
        label: `Document ${doc.doc_type}`,
        detail: `Status: ${doc.status}`,
      });
    });
    relations.partnerClients.forEach((row) => {
      rows.push({
        at: String(row.created_at ?? ""),
        type: "relation",
        label: "Partner -> Client link",
        detail: String(row.full_name ?? row.email ?? row.id ?? "Client"),
      });
    });
    relations.riderPartners.forEach((row) => {
      rows.push({
        at: String(row.created_at ?? ""),
        type: "relation",
        label: "Rider -> Partner link",
        detail: String(row.org_name ?? row.contact_name ?? row.email ?? row.id ?? "Partner"),
      });
    });
    return rows
      .filter((item) => (historyType === "all" ? true : item.type === historyType))
      .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());
  }, [activity, documents, history.bookings, history.trips, historyType, relations.partnerClients, relations.riderPartners]);

  if (error) return <Card><p className="text-red-600">{error}</p></Card>;
  if (!data) return <Card><p>Loading...</p></Card>;

  const { user, riderProfile, driverProfile, partnerProfile, adminProfile, bookingsCount, partnerClientsCount } = data;
  const tripsCount = data.tripsCount ?? 0;
  const supportTicketsCount = data.supportTicketsCount ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/users"><Button variant="outline">← Back</Button></Link>
      </div>
      <Card>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">User Detail</h1>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roles:</strong> {user.roles.join(", ")}</p>
          <p><strong>Status:</strong> <Badge tone={user.is_active ? "certified" : "pending"}>{user.is_active ? "Active" : "Suspended"}</Badge></p>
          <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span><strong>Bookings</strong> (as rider): {bookingsCount}</span>
          {user.roles.includes("driver") ? (
            <span><strong>Trips</strong> (as driver): {tripsCount}</span>
          ) : null}
          {user.roles.includes("partner") ? (
            <span><strong>Partner clients</strong>: {partnerClientsCount}</span>
          ) : null}
          <span><strong>Support tickets</strong> (filed): {supportTicketsCount}</span>
        </div>
        {!user.is_super_admin && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={user.is_active ? "danger" : "primary"}
              disabled={saving}
              onClick={toggleActive}
            >
              {user.is_active ? "Suspend User" : "Activate User"}
            </Button>
            <Button
              variant="danger"
              disabled={saving}
              onClick={deleteUser}
            >
              Delete User
            </Button>
          </div>
        )}
        <div className="mt-4 border-t border-slate-200 pt-4">
          <h3 className="font-medium text-slate-700">Change Password (Super Admin only)</h3>
          <p className="mt-1 text-sm text-slate-500">Set a new password and optionally email it to the user.</p>
          {changePwOpen ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">New password</label>
                <Input
                  type="password"
                  placeholder="8+ chars, symbol, number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="max-w-xs"
                />
                <PasswordStrength password={newPassword} inline />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                Email new password to user
              </label>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={changePassword}>Update & Send</Button>
                <Button variant="outline" onClick={() => { setChangePwOpen(false); setNewPassword(""); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="mt-2" onClick={() => setChangePwOpen(true)}>Change Password</Button>
          )}
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap gap-2">
          {(["overview", "relations", "documents", "history", "activity", "support"] as const).map((t) => (
            <Button key={t} variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
              {t === "support" ? "Support tickets" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
        {msg ? <p className="mt-3 text-sm text-slate-600">{msg}</p> : null}
      </Card>
      {tab === "documents" && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Documents</h2>
          {documents.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No documents found for this user.</p>
          ) : (
            <div className="mt-2 space-y-2 text-sm">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-slate-200 p-3">
                  <p><strong>{doc.doc_type}</strong></p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    <Select
                      value={docDrafts[doc.id]?.status ?? doc.status}
                      onChange={(e) =>
                        setDocDrafts((prev) => ({
                          ...prev,
                          [doc.id]: {
                            status: e.target.value,
                            admin_notes: prev[doc.id]?.admin_notes ?? doc.admin_notes ?? "",
                          },
                        }))
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Needs More Information">Needs More Information</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                    <Textarea
                      placeholder="Admin notes"
                      value={docDrafts[doc.id]?.admin_notes ?? doc.admin_notes ?? ""}
                      onChange={(e) =>
                        setDocDrafts((prev) => ({
                          ...prev,
                          [doc.id]: {
                            status: prev[doc.id]?.status ?? doc.status,
                            admin_notes: e.target.value,
                          },
                        }))
                      }
                    />
                    <Button disabled={saving} onClick={() => verifyDocument(doc.id)}>Save Verification</Button>
                  </div>
                  <p>Expiry: {doc.expiry ? new Date(doc.expiry).toLocaleDateString() : "—"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {tab === "history" && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Unified Timeline</h2>
          <p className="mt-2 text-sm text-slate-600">Bookings: {history.bookings.length} • Trips: {history.trips.length} • Activity: {activity.length}</p>
          <div className="mt-3 grid max-w-sm gap-2">
            <Select value={historyType} onChange={(e) => setHistoryType(e.target.value as typeof historyType)}>
              <option value="all">All events</option>
              <option value="booking">Bookings</option>
              <option value="trip">Trips</option>
              <option value="activity">Activity</option>
              <option value="document">Documents</option>
              <option value="relation">Relationships</option>
            </Select>
            <Select value={String(timelineLimit)} onChange={(e) => setTimelineLimit(Number(e.target.value))}>
              <option value="40">Show 40 events</option>
              <option value="80">Show 80 events</option>
              <option value="120">Show 120 events</option>
              <option value="200">Show 200 events</option>
            </Select>
            <Button variant="outline" onClick={exportTimelineCsv}>Export Timeline CSV</Button>
          </div>
          <div className="mt-3 space-y-2">
            {timeline.slice(0, timelineLimit).map((event, idx) => (
              <div key={`t-${idx}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-medium">{event.label}</p>
                <p>{event.detail}</p>
                <p className="text-xs text-slate-500">{event.at ? new Date(event.at).toLocaleString() : "—"}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {tab === "support" && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Support tickets</h2>
          <p className="mt-1 text-sm text-slate-600">Tickets this user created across portals.</p>
          <div className="mt-3 max-w-xs">
            <Select value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </Select>
          </div>
          {supportTickets.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No tickets for this user.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {supportTickets.map((row) => (
                <div key={String(row.id)} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{String(row.issue_type ?? "Issue")}</p>
                      <p className="text-xs text-slate-500">{String(row.role ?? "")} · {row.created_at ? new Date(String(row.created_at)).toLocaleString() : "—"}</p>
                      {row.reference_id ? <p className="text-xs text-slate-500">Ref: {String(row.reference_id)}</p> : null}
                    </div>
                    <Badge tone={String(row.status) === "Open" ? "pending" : "certified"}>{String(row.status ?? "—")}</Badge>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">{String(row.message ?? "")}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Select
                      value=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) void updateTicketStatus(String(row.id), v);
                      }}
                      disabled={saving}
                    >
                      <option value="">Change status…</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {tab === "activity" && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Activity</h2>
          {activity.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No activity records for this user.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {activity.slice(0, 40).map((row, idx) => (
                <div key={`a-${idx}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p><strong>{String(row.action ?? "action")}</strong> • {String(row.entity_type ?? "entity")}</p>
                  <p className="text-xs text-slate-500">{String(row.created_at ?? "")}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {tab === "relations" && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Relationships</h2>
          <p className="mt-2 text-sm text-slate-600">
            Partner clients: {relations.partnerClients.length} • Rider partners: {relations.riderPartners.length}
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {user.roles.includes("partner") ? (
              <>
                <Select value={selectedRiderId} onChange={(e) => setSelectedRiderId(e.target.value)}>
                  <option value="">Assign rider to this partner</option>
                  {riders
                    .filter((r) => !relations.partnerClients.some((pc) => String(pc.id) === r.id))
                    .map((rider) => (
                      <option key={rider.id} value={rider.id}>{rider.full_name || rider.email}</option>
                    ))}
                </Select>
                <Textarea
                  placeholder="Relationship notes"
                  value={relationNotes}
                  onChange={(e) => setRelationNotes(e.target.value)}
                />
              </>
            ) : user.roles.includes("rider") ? (
              <>
                <Select value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)}>
                  <option value="">Assign partner to this rider</option>
                  {partners
                    .filter((p) => !relations.riderPartners.some((rp) => String(rp.id) === p.id))
                    .map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.contact_name || partner.org_name || partner.email}
                      </option>
                    ))}
                </Select>
                <Textarea
                  placeholder="Relationship notes"
                  value={relationNotes}
                  onChange={(e) => setRelationNotes(e.target.value)}
                />
              </>
            ) : (
              <p className="text-sm text-slate-500 md:col-span-3">Relation management is available for partner and rider profiles.</p>
            )}
            <Button
              disabled={saving || (!selectedRiderId && !selectedPartnerId)}
              onClick={addRelation}
            >
              Add Relationship
            </Button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Clients managed by this partner</h3>
              <div className="mt-2 space-y-2">
                {relations.partnerClients.slice(0, 30).map((row, idx) => (
                  <div key={`pc-${idx}`} className="rounded-lg border border-slate-200 p-2 text-sm">
                    <p>
                      <Link href={`/admin/users/${String(row.id)}`} className="font-medium text-[var(--color-primary)] hover:underline">
                        {String(row.full_name ?? row.email ?? row.id ?? "Client")}
                      </Link>
                    </p>
                    {user.roles.includes("partner") && (
                      <Button
                        variant="outline"
                        className="mt-2"
                        disabled={saving}
                        onClick={() => removeRelation(id, String(row.id))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Partners linked to this rider</h3>
              <div className="mt-2 space-y-2">
                {relations.riderPartners.slice(0, 30).map((row, idx) => (
                  <div key={`rp-${idx}`} className="rounded-lg border border-slate-200 p-2 text-sm">
                    <p>
                      <Link href={`/admin/users/${String(row.id)}`} className="font-medium text-[var(--color-primary)] hover:underline">
                        {String(row.org_name ?? row.contact_name ?? row.email ?? row.id ?? "Partner")}
                      </Link>
                    </p>
                    {user.roles.includes("rider") && (
                      <Button
                        variant="outline"
                        className="mt-2"
                        disabled={saving}
                        onClick={() => removeRelation(String(row.id), id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
      {tab !== "overview" ? null : (
        <>
      {riderProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Rider Profile</h2>
          {editing === "rider" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="NDIS ID" value={form.ndisId} onChange={(e) => setForm((p) => ({ ...p, ndisId: e.target.value }))} />
              <Input
                type="email"
                placeholder="Plan manager email (invoicing)"
                value={form.planManagerEmail}
                onChange={(e) => setForm((p) => ({ ...p, planManagerEmail: e.target.value }))}
              />
              <p className="text-xs font-medium text-slate-600">Home address (invoice PDFs & records)</p>
              <Input placeholder="Street address" value={form.addressLine1} onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))} />
              <div className="grid gap-2 md:grid-cols-3">
                <Input placeholder="Suburb" value={form.suburb} onChange={(e) => setForm((p) => ({ ...p, suburb: e.target.value }))} />
                <Input placeholder="State" value={form.addressState} onChange={(e) => setForm((p) => ({ ...p, addressState: e.target.value }))} />
                <Input placeholder="Postcode" value={form.postcode} onChange={(e) => setForm((p) => ({ ...p, postcode: e.target.value }))} />
              </div>
              <p className="text-sm">Bookings: {bookingsCount}</p>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Name: {riderProfile.full_name || "-"}</p>
              <p>Phone: {riderProfile.phone || "-"}</p>
              <p>NDIS ID: {riderProfile.ndis_id || "-"}</p>
              <p>Plan manager email: {riderProfile.plan_manager_email || "—"}</p>
              <p>
                Address:{" "}
                {[riderProfile.address_line1, riderProfile.suburb, riderProfile.state, riderProfile.postcode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
              <p>Bookings: {bookingsCount}</p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("rider")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {driverProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Driver Profile</h2>
          {editing === "driver" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Vehicle rego" value={form.vehicleRego} onChange={(e) => setForm((p) => ({ ...p, vehicleRego: e.target.value }))} />
              <p className="text-sm">Trips completed / assigned: {tripsCount}</p>
              <p className="text-sm">Verification: <Badge tone={driverProfile.verification_status === "Approved" ? "certified" : "pending"}>{driverProfile.verification_status}</Badge></p>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Name: {driverProfile.full_name || "-"}</p>
              <p>Phone: {driverProfile.phone || "-"}</p>
              <p>Vehicle: {driverProfile.vehicle_rego || "-"}</p>
              <p>Trips (as driver): {tripsCount}</p>
              <p>Verification: <Badge tone={driverProfile.verification_status === "Approved" ? "certified" : "pending"}>{driverProfile.verification_status}</Badge></p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("driver")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {partnerProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Partner Profile</h2>
          {editing === "partner" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Org name" value={form.orgName} onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))} />
              <Input placeholder="Contact name" value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} />
              <p className="text-sm">Assigned clients: {partnerClientsCount}</p>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Org: {partnerProfile.org_name || "-"}</p>
              <p>Contact: {partnerProfile.contact_name || "-"}</p>
              <p>Assigned clients: {partnerClientsCount}</p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("partner")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {adminProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Admin Profile</h2>
          {editing === "admin" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Display name" value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} />
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Display: {adminProfile.display_name || "-"}</p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("admin")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
        </>
      )}
    </div>
  );
}
