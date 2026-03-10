"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type SearchResult = {
  users: Array<{ id: string; email: string; is_active: boolean; rider_name?: string; driver_name?: string; partner_contact?: string; partner_org?: string }>;
  bookings: Array<{ id: string; rider_id?: string; pickup: string; dropoff: string; status: string; scheduled_at?: string; rider_email?: string }>;
  trips: Array<{ id: string; state: string; booking_id?: string; rider_id?: string; driver_id?: string; pickup?: string; dropoff?: string }>;
  tickets: Array<{ id: string; role: string; issue_type: string; priority: string; status: string; created_by?: string; created_by_email?: string }>;
  documents: Array<{ id: string; doc_type: string; status: string; expiry?: string; driver_id?: string; driver_email?: string }>;
};

type SearchKind = "all" | "users" | "bookings" | "trips" | "tickets" | "documents";

type PresetKey =
  | "none"
  | "pending_tickets"
  | "resolved_tickets"
  | "expiring_documents"
  | "cancelled_trips"
  | "pending_bookings"
  | "inactive_users";

const SEARCH_PREFS_KEY = "lumi_admin_search_prefs_v1";
const SEARCH_VIEWS_KEY = "lumi_admin_search_views_v1";

type SavedSearchView = {
  id: string;
  name: string;
  q: string;
  kind: SearchKind;
  preset: PresetKey;
  createdAt: string;
};

export default function AdminSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<SearchKind>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [batchSaving, setBatchSaving] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetKey>("none");
  const [prefsRestored, setPrefsRestored] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [data, setData] = useState<SearchResult>({ users: [], bookings: [], trips: [], tickets: [], documents: [] });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedSearchView[]>([]);
  const [viewName, setViewName] = useState("");
  const [urlHydrated, setUrlHydrated] = useState(false);

  const session = getAuthSession();

  function toKind(value: string | null): SearchKind | null {
    if (value === "all" || value === "users" || value === "bookings" || value === "trips" || value === "tickets" || value === "documents") {
      return value;
    }
    return null;
  }

  function toPreset(value: string | null): PresetKey | null {
    if (
      value === "none" ||
      value === "pending_tickets" ||
      value === "resolved_tickets" ||
      value === "expiring_documents" ||
      value === "cancelled_trips" ||
      value === "pending_bookings" ||
      value === "inactive_users"
    ) {
      return value;
    }
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(SEARCH_PREFS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        q?: string;
        kind?: SearchKind;
        preset?: PresetKey;
      };
      if (typeof parsed.q === "string") setQ(parsed.q);
      if (parsed.kind) setKind(parsed.kind);
      if (parsed.preset) setPreset(parsed.preset);
    } catch {
      // ignore malformed local storage
    } finally {
      setPrefsRestored(true);
    }
  }, []);

  useEffect(() => {
    const qFromUrl = searchParams.get("q");
    const kindFromUrl = toKind(searchParams.get("kind"));
    const presetFromUrl = toPreset(searchParams.get("preset"));
    if (qFromUrl !== null) setQ(qFromUrl);
    if (kindFromUrl) setKind(kindFromUrl);
    if (presetFromUrl) setPreset(presetFromUrl);
    setUrlHydrated(true);
    // Keep UI in sync with URL state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(SEARCH_VIEWS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedSearchView[];
      if (Array.isArray(parsed)) {
        setSavedViews(parsed.filter((v) => !!v?.id && !!v?.name));
      }
    } catch {
      // ignore malformed local storage
    }
  }, []);

  useEffect(() => {
    if (!prefsRestored || typeof window === "undefined") return;
    window.localStorage.setItem(
      SEARCH_PREFS_KEY,
      JSON.stringify({ q, kind, preset }),
    );
  }, [prefsRestored, q, kind, preset]);

  useEffect(() => {
    if (!urlHydrated) return;
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (kind !== "all") params.set("kind", kind);
    if (preset !== "none") params.set("preset", preset);
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl);
  }, [urlHydrated, q, kind, preset, pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SEARCH_VIEWS_KEY, JSON.stringify(savedViews));
  }, [savedViews]);

  useEffect(() => {
    if (!prefsRestored || autoLoaded || !session?.accessToken || !q.trim()) return;
    setAutoLoaded(true);
    runSearch().catch(() => undefined);
  }, [prefsRestored, autoLoaded, session?.accessToken, q]);

  async function runSearch() {
    if (!session?.accessToken || !q.trim()) return;
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await apiJson<SearchResult>(`/admin/search?q=${encodeURIComponent(q.trim())}`, undefined, session.accessToken);
      setData(res);
      setSelectedUserIds([]);
      setSelectedBookingIds([]);
      setSelectedTripIds([]);
      setSelectedTicketIds([]);
      setSelectedDocumentIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo<SearchResult>(() => {
    if (preset === "none") return data;
    if (preset === "pending_tickets") {
      return {
        ...data,
        tickets: data.tickets.filter((t) => t.status === "open" || t.status === "in_review"),
      };
    }
    if (preset === "resolved_tickets") {
      return {
        ...data,
        tickets: data.tickets.filter((t) => t.status === "resolved" || t.status === "closed"),
      };
    }
    if (preset === "expiring_documents") {
      const now = Date.now();
      const max = now + 30 * 24 * 60 * 60 * 1000;
      return {
        ...data,
        documents: data.documents.filter((d) => {
          if (!d.expiry) return false;
          const ts = new Date(d.expiry).getTime();
          return Number.isFinite(ts) && ts >= now && ts <= max;
        }),
      };
    }
    if (preset === "cancelled_trips") {
      return {
        ...data,
        trips: data.trips.filter((t) => t.state === "Cancelled"),
      };
    }
    if (preset === "pending_bookings") {
      return {
        ...data,
        bookings: data.bookings.filter((b) => b.status === "pending_matching"),
      };
    }
    if (preset === "inactive_users") {
      return {
        ...data,
        users: data.users.filter((u) => !u.is_active),
      };
    }
    return data;
  }, [data, preset]);

  const counts = useMemo(
    () => ({
      users: filteredData.users.length,
      bookings: filteredData.bookings.length,
      trips: filteredData.trips.length,
      tickets: filteredData.tickets.length,
      documents: filteredData.documents.length,
    }),
    [filteredData],
  );

  async function setUserActive(userId: string, isActive: boolean) {
    if (!session?.accessToken) return;
    setSavingId(`user-${userId}`);
    setMsg("");
    try {
      await apiJson(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      }, session.accessToken);
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)),
      }));
      setMsg(`User ${isActive ? "activated" : "suspended"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed user update");
    } finally {
      setSavingId(null);
    }
  }

  async function setBookingStatus(bookingId: string, status: "cancelled" | "pending_matching" | "confirmed") {
    if (!session?.accessToken) return;
    setSavingId(`booking-${bookingId}`);
    setMsg("");
    try {
      await apiJson(`/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, session.accessToken);
      setData((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      }));
      setMsg("Booking status updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed booking update");
    } finally {
      setSavingId(null);
    }
  }

  async function setTripState(tripId: string, state: "Assigned" | "InProgress" | "Completed" | "Cancelled") {
    if (!session?.accessToken) return;
    setSavingId(`trip-${tripId}`);
    setMsg("");
    try {
      await apiJson(`/admin/trips/${tripId}/state`, {
        method: "PATCH",
        body: JSON.stringify({ state }),
      }, session.accessToken);
      setData((prev) => ({
        ...prev,
        trips: prev.trips.map((t) => (t.id === tripId ? { ...t, state } : t)),
      }));
      setMsg("Trip state updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed trip update");
    } finally {
      setSavingId(null);
    }
  }

  async function setTicketStatus(ticketId: string, status: "open" | "in_review" | "resolved" | "closed") {
    if (!session?.accessToken) return;
    setSavingId(`ticket-${ticketId}`);
    setMsg("");
    try {
      await apiJson(`/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, session.accessToken);
      setData((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
      }));
      setMsg("Ticket status updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed ticket update");
    } finally {
      setSavingId(null);
    }
  }

  async function setDocumentStatus(documentId: string, status: "Approved" | "Rejected" | "Pending") {
    if (!session?.accessToken) return;
    setSavingId(`doc-${documentId}`);
    setMsg("");
    try {
      await apiJson(`/admin/documents/${documentId}/verify`, {
        method: "POST",
        body: JSON.stringify({ status }),
      }, session.accessToken);
      setData((prev) => ({
        ...prev,
        documents: prev.documents.map((d) => (d.id === documentId ? { ...d, status } : d)),
      }));
      setMsg("Document status updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed document update");
    } finally {
      setSavingId(null);
    }
  }

  function toggleSelected(id: string, selected: string[], setSelected: (v: string[]) => void) {
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  async function batchUpdateUsers(isActive: boolean) {
    if (!session?.accessToken || selectedUserIds.length === 0) return;
    setBatchSaving("users");
    setMsg("");
    try {
      await Promise.all(
        selectedUserIds.map((id) =>
          apiJson(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) }, session.accessToken),
        ),
      );
      setData((prev) => ({ ...prev, users: prev.users.map((u) => (selectedUserIds.includes(u.id) ? { ...u, is_active: isActive } : u)) }));
      setMsg(`Updated ${selectedUserIds.length} users.`);
      setSelectedUserIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch user update failed");
    } finally {
      setBatchSaving(null);
    }
  }

  async function batchUpdateBookings(status: "cancelled" | "pending_matching" | "confirmed") {
    if (!session?.accessToken || selectedBookingIds.length === 0) return;
    setBatchSaving("bookings");
    setMsg("");
    try {
      await Promise.all(
        selectedBookingIds.map((id) =>
          apiJson(`/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, session.accessToken),
        ),
      );
      setData((prev) => ({ ...prev, bookings: prev.bookings.map((b) => (selectedBookingIds.includes(b.id) ? { ...b, status } : b)) }));
      setMsg(`Updated ${selectedBookingIds.length} bookings.`);
      setSelectedBookingIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch booking update failed");
    } finally {
      setBatchSaving(null);
    }
  }

  async function batchUpdateTrips(state: "Assigned" | "InProgress" | "Completed" | "Cancelled") {
    if (!session?.accessToken || selectedTripIds.length === 0) return;
    setBatchSaving("trips");
    setMsg("");
    try {
      await Promise.all(
        selectedTripIds.map((id) =>
          apiJson(`/admin/trips/${id}/state`, { method: "PATCH", body: JSON.stringify({ state }) }, session.accessToken),
        ),
      );
      setData((prev) => ({ ...prev, trips: prev.trips.map((t) => (selectedTripIds.includes(t.id) ? { ...t, state } : t)) }));
      setMsg(`Updated ${selectedTripIds.length} trips.`);
      setSelectedTripIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch trip update failed");
    } finally {
      setBatchSaving(null);
    }
  }

  async function batchUpdateTickets(status: "open" | "in_review" | "resolved" | "closed") {
    if (!session?.accessToken || selectedTicketIds.length === 0) return;
    setBatchSaving("tickets");
    setMsg("");
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          apiJson(`/admin/support-tickets/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, session.accessToken),
        ),
      );
      setData((prev) => ({ ...prev, tickets: prev.tickets.map((t) => (selectedTicketIds.includes(t.id) ? { ...t, status } : t)) }));
      setMsg(`Updated ${selectedTicketIds.length} tickets.`);
      setSelectedTicketIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch ticket update failed");
    } finally {
      setBatchSaving(null);
    }
  }

  async function batchUpdateDocuments(status: "Approved" | "Rejected" | "Pending") {
    if (!session?.accessToken || selectedDocumentIds.length === 0) return;
    setBatchSaving("documents");
    setMsg("");
    try {
      await Promise.all(
        selectedDocumentIds.map((id) =>
          apiJson(`/admin/documents/${id}/verify`, { method: "POST", body: JSON.stringify({ status }) }, session.accessToken),
        ),
      );
      setData((prev) => ({ ...prev, documents: prev.documents.map((d) => (selectedDocumentIds.includes(d.id) ? { ...d, status } : d)) }));
      setMsg(`Updated ${selectedDocumentIds.length} documents.`);
      setSelectedDocumentIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch document update failed");
    } finally {
      setBatchSaving(null);
    }
  }

  function escapeCsvCell(value: unknown) {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function exportCsv(filename: string, rows: Record<string, unknown>[]) {
    if (rows.length === 0) {
      setMsg("No rows selected to export.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportSelectedUsers() {
    const rows = data.users
      .filter((u) => selectedUserIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email,
        is_active: u.is_active,
        rider_name: u.rider_name ?? "",
        driver_name: u.driver_name ?? "",
        partner_contact: u.partner_contact ?? "",
        partner_org: u.partner_org ?? "",
      }));
    exportCsv("users-selected.csv", rows);
  }

  function exportSelectedBookings() {
    const rows = data.bookings
      .filter((b) => selectedBookingIds.includes(b.id))
      .map((b) => ({
        id: b.id,
        rider_email: b.rider_email ?? "",
        pickup: b.pickup,
        dropoff: b.dropoff,
        status: b.status,
        scheduled_at: b.scheduled_at ?? "",
      }));
    exportCsv("bookings-selected.csv", rows);
  }

  function exportSelectedTrips() {
    const rows = data.trips
      .filter((t) => selectedTripIds.includes(t.id))
      .map((t) => ({
        id: t.id,
        booking_id: t.booking_id ?? "",
        state: t.state,
        pickup: t.pickup ?? "",
        dropoff: t.dropoff ?? "",
      }));
    exportCsv("trips-selected.csv", rows);
  }

  function exportSelectedTickets() {
    const rows = data.tickets
      .filter((t) => selectedTicketIds.includes(t.id))
      .map((t) => ({
        id: t.id,
        role: t.role,
        issue_type: t.issue_type,
        priority: t.priority,
        status: t.status,
        created_by_email: t.created_by_email ?? "",
      }));
    exportCsv("tickets-selected.csv", rows);
  }

  function exportSelectedDocuments() {
    const rows = data.documents
      .filter((d) => selectedDocumentIds.includes(d.id))
      .map((d) => ({
        id: d.id,
        doc_type: d.doc_type,
        status: d.status,
        expiry: d.expiry ?? "",
        driver_id: d.driver_id ?? "",
        driver_email: d.driver_email ?? "",
      }));
    exportCsv("documents-selected.csv", rows);
  }

  function saveCurrentView() {
    const name = viewName.trim();
    if (!name) {
      setMsg("Enter a view name first.");
      return;
    }
    const view: SavedSearchView = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      q,
      kind,
      preset,
      createdAt: new Date().toISOString(),
    };
    setSavedViews((prev) => [view, ...prev].slice(0, 20));
    setViewName("");
    setMsg(`Saved view: ${name}`);
  }

  function applyView(view: SavedSearchView) {
    setQ(view.q);
    setKind(view.kind);
    setPreset(view.preset);
    setMsg(`Applied view: ${view.name}`);
  }

  function buildDeepLinkForView(view: Pick<SavedSearchView, "q" | "kind" | "preset">) {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    if (view.q.trim()) params.set("q", view.q.trim());
    if (view.kind !== "all") params.set("kind", view.kind);
    if (view.preset !== "none") params.set("preset", view.preset);
    return `${window.location.origin}${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  }

  async function copyDeepLinkForView(view: Pick<SavedSearchView, "q" | "kind" | "preset">) {
    const link = buildDeepLinkForView(view);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setMsg("Deep link copied.");
    } catch {
      setMsg("Copy failed. Please copy from address bar.");
    }
  }

  function deleteView(id: string) {
    setSavedViews((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Global Search</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Search users, bookings, trips, support tickets, and compliance docs from one admin view.
        </p>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search by email, ID, route, status..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch().catch(() => undefined);
            }}
          />
          <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="all">All Entities</option>
            <option value="users">Users</option>
            <option value="bookings">Bookings</option>
            <option value="trips">Trips</option>
            <option value="tickets">Tickets</option>
            <option value="documents">Documents</option>
          </Select>
          <Button disabled={loading || !q.trim()} onClick={() => runSearch().catch(() => undefined)}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setData({ users: [], bookings: [], trips: [], tickets: [], documents: [] });
              setKind("all");
              setPreset("none");
              setError("");
            }}
          >
            Clear
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              copyDeepLinkForView({
                q,
                kind,
                preset,
              }).catch(() => undefined)
            }
          >
            Share Current View
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const url = buildDeepLinkForView({
                q,
                kind,
                preset,
              });
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            Open Current View Link
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant={preset === "pending_tickets" ? "primary" : "outline"} onClick={() => { setPreset("pending_tickets"); setKind("tickets"); }}>
            Pending Tickets
          </Button>
          <Button variant={preset === "resolved_tickets" ? "primary" : "outline"} onClick={() => { setPreset("resolved_tickets"); setKind("tickets"); }}>
            Resolved Tickets
          </Button>
          <Button variant={preset === "expiring_documents" ? "primary" : "outline"} onClick={() => { setPreset("expiring_documents"); setKind("documents"); }}>
            Expiring Documents (30d)
          </Button>
          <Button variant={preset === "cancelled_trips" ? "primary" : "outline"} onClick={() => { setPreset("cancelled_trips"); setKind("trips"); }}>
            Cancelled Trips
          </Button>
          <Button variant={preset === "pending_bookings" ? "primary" : "outline"} onClick={() => { setPreset("pending_bookings"); setKind("bookings"); }}>
            Pending Bookings
          </Button>
          <Button variant={preset === "inactive_users" ? "primary" : "outline"} onClick={() => { setPreset("inactive_users"); setKind("users"); }}>
            Inactive Users
          </Button>
          <Button variant="outline" onClick={() => setPreset("none")}>Clear Preset</Button>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-700">Saved Views</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <Input
              placeholder="View name (e.g. Morning triage)"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <Button variant="outline" onClick={saveCurrentView}>Save Current View</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSavedViews([]);
                setMsg("Cleared saved views.");
              }}
            >
              Clear All Views
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {savedViews.length === 0 ? (
              <p className="text-xs text-slate-500">No saved views yet.</p>
            ) : (
              savedViews.map((view) => (
                <div key={view.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                  <p className="font-medium text-slate-800">{view.name}</p>
                  <p className="text-xs text-slate-500">
                    q="{view.q || "-"}" • {view.kind} • {view.preset}
                  </p>
                  <Button variant="outline" onClick={() => applyView(view)}>Apply</Button>
                  <Button variant="outline" onClick={() => copyDeepLinkForView(view).catch(() => undefined)}>Copy Link</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = buildDeepLinkForView(view);
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Open Link
                  </Button>
                  <Button variant="outline" onClick={() => deleteView(view.id)}>Delete</Button>
                </div>
              ))
            )}
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        <Card><p className="text-xs text-slate-500">Users</p><p className="text-2xl font-bold">{counts.users}</p></Card>
        <Card><p className="text-xs text-slate-500">Bookings</p><p className="text-2xl font-bold">{counts.bookings}</p></Card>
        <Card><p className="text-xs text-slate-500">Trips</p><p className="text-2xl font-bold">{counts.trips}</p></Card>
        <Card><p className="text-xs text-slate-500">Tickets</p><p className="text-2xl font-bold">{counts.tickets}</p></Card>
        <Card><p className="text-xs text-slate-500">Documents</p><p className="text-2xl font-bold">{counts.documents}</p></Card>
      </div>

      {(kind === "all" || kind === "users") && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Users</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedUserIds(filteredData.users.map((u) => u.id))}>Select all</Button>
            <Button variant="outline" onClick={() => setSelectedUserIds([])}>Clear</Button>
            <Button variant="outline" disabled={selectedUserIds.length === 0} onClick={exportSelectedUsers}>Export selected CSV</Button>
            <Button disabled={batchSaving === "users" || selectedUserIds.length === 0} onClick={() => batchUpdateUsers(true).catch(() => undefined)}>Activate selected</Button>
            <Button variant="danger" disabled={batchSaving === "users" || selectedUserIds.length === 0} onClick={() => batchUpdateUsers(false).catch(() => undefined)}>Suspend selected</Button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="py-2 pr-3">Pick</th><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Info</th><th className="py-2">Action</th></tr></thead>
              <tbody>
                {filteredData.users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 pr-3"><input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleSelected(u.id, selectedUserIds, setSelectedUserIds)} /></td>
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2 pr-3">{u.rider_name || u.driver_name || u.partner_contact || u.partner_org || "-"}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/users/${u.id}`}><Button variant="outline">Open</Button></Link>
                        <Button
                          variant={u.is_active ? "danger" : "primary"}
                          disabled={savingId === `user-${u.id}`}
                          onClick={() => setUserActive(u.id, !u.is_active).catch(() => undefined)}
                        >
                          {u.is_active ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(kind === "all" || kind === "bookings") && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Bookings</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedBookingIds(filteredData.bookings.map((b) => b.id))}>Select all</Button>
            <Button variant="outline" onClick={() => setSelectedBookingIds([])}>Clear</Button>
            <Button variant="outline" disabled={selectedBookingIds.length === 0} onClick={exportSelectedBookings}>Export selected CSV</Button>
            <Button disabled={batchSaving === "bookings" || selectedBookingIds.length === 0} onClick={() => batchUpdateBookings("pending_matching").catch(() => undefined)}>Set pending</Button>
            <Button disabled={batchSaving === "bookings" || selectedBookingIds.length === 0} onClick={() => batchUpdateBookings("confirmed").catch(() => undefined)}>Set confirmed</Button>
            <Button variant="danger" disabled={batchSaving === "bookings" || selectedBookingIds.length === 0} onClick={() => batchUpdateBookings("cancelled").catch(() => undefined)}>Set cancelled</Button>
          </div>
          <div className="mt-3 space-y-2">
            {filteredData.bookings.map((b) => (
              <div key={b.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <label className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={selectedBookingIds.includes(b.id)} onChange={() => toggleSelected(b.id, selectedBookingIds, setSelectedBookingIds)} />
                  Select
                </label>
                <p className="font-medium">{b.pickup} {"->"} {b.dropoff}</p>
                <p>
                  {b.rider_id ? (
                    <Link href={`/admin/users/${b.rider_id}`} className="text-[var(--color-primary)] hover:underline">{b.rider_email || b.rider_id}</Link>
                  ) : (
                    b.rider_email || "-"
                  )}
                  {" • "}{b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "-"}
                </p>
                <Badge tone="default">{b.status}</Badge>
                <div className="mt-2 flex flex-wrap gap-2">
                  {b.rider_id && <Link href={`/admin/users/${b.rider_id}`}><Button variant="outline">Rider</Button></Link>}
                  {(["pending_matching", "confirmed", "cancelled"] as const).map((status) => (
                    <Button
                      key={`${b.id}-${status}`}
                      variant="outline"
                      disabled={savingId === `booking-${b.id}`}
                      onClick={() => setBookingStatus(b.id, status).catch(() => undefined)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(kind === "all" || kind === "trips") && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trips</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedTripIds(filteredData.trips.map((t) => t.id))}>Select all</Button>
            <Button variant="outline" onClick={() => setSelectedTripIds([])}>Clear</Button>
            <Button variant="outline" disabled={selectedTripIds.length === 0} onClick={exportSelectedTrips}>Export selected CSV</Button>
            <Button disabled={batchSaving === "trips" || selectedTripIds.length === 0} onClick={() => batchUpdateTrips("Assigned").catch(() => undefined)}>Assigned</Button>
            <Button disabled={batchSaving === "trips" || selectedTripIds.length === 0} onClick={() => batchUpdateTrips("InProgress").catch(() => undefined)}>InProgress</Button>
            <Button disabled={batchSaving === "trips" || selectedTripIds.length === 0} onClick={() => batchUpdateTrips("Completed").catch(() => undefined)}>Completed</Button>
            <Button variant="danger" disabled={batchSaving === "trips" || selectedTripIds.length === 0} onClick={() => batchUpdateTrips("Cancelled").catch(() => undefined)}>Cancelled</Button>
          </div>
          <div className="mt-3 space-y-2">
            {filteredData.trips.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <label className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={selectedTripIds.includes(t.id)} onChange={() => toggleSelected(t.id, selectedTripIds, setSelectedTripIds)} />
                  Select
                </label>
                <p className="font-medium">{t.id}</p>
                <p>{t.pickup || "-"} {"->"} {t.dropoff || "-"}</p>
                <Badge tone="default">{t.state}</Badge>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.rider_id && <Link href={`/admin/users/${t.rider_id}`}><Button variant="outline">Rider</Button></Link>}
                  {t.driver_id && <Link href={`/admin/users/${t.driver_id}`}><Button variant="outline">Driver</Button></Link>}
                  {(["Assigned", "InProgress", "Completed", "Cancelled"] as const).map((state) => (
                    <Button
                      key={`${t.id}-${state}`}
                      variant="outline"
                      disabled={savingId === `trip-${t.id}`}
                      onClick={() => setTripState(t.id, state).catch(() => undefined)}
                    >
                      {state}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(kind === "all" || kind === "tickets") && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Support Tickets</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedTicketIds(filteredData.tickets.map((t) => t.id))}>Select all</Button>
            <Button variant="outline" onClick={() => setSelectedTicketIds([])}>Clear</Button>
            <Button variant="outline" disabled={selectedTicketIds.length === 0} onClick={exportSelectedTickets}>Export selected CSV</Button>
            <Button disabled={batchSaving === "tickets" || selectedTicketIds.length === 0} onClick={() => batchUpdateTickets("open").catch(() => undefined)}>Open</Button>
            <Button disabled={batchSaving === "tickets" || selectedTicketIds.length === 0} onClick={() => batchUpdateTickets("in_review").catch(() => undefined)}>In review</Button>
            <Button disabled={batchSaving === "tickets" || selectedTicketIds.length === 0} onClick={() => batchUpdateTickets("resolved").catch(() => undefined)}>Resolved</Button>
            <Button variant="danger" disabled={batchSaving === "tickets" || selectedTicketIds.length === 0} onClick={() => batchUpdateTickets("closed").catch(() => undefined)}>Closed</Button>
          </div>
          <div className="mt-3 space-y-2">
            {filteredData.tickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <label className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={selectedTicketIds.includes(t.id)} onChange={() => toggleSelected(t.id, selectedTicketIds, setSelectedTicketIds)} />
                  Select
                </label>
                <p className="font-medium">{t.issue_type} ({t.role})</p>
                <p>
                  {t.created_by ? (
                    <Link href={`/admin/users/${t.created_by}`} className="text-[var(--color-primary)] hover:underline">
                      {t.created_by_email || t.created_by}
                    </Link>
                  ) : (
                    t.created_by_email || "-"
                  )}
                </p>
                <p>Status: {t.status} • Priority: {t.priority}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["open", "in_review", "resolved", "closed"] as const).map((status) => (
                    <Button
                      key={`${t.id}-${status}`}
                      variant="outline"
                      disabled={savingId === `ticket-${t.id}`}
                      onClick={() => setTicketStatus(t.id, status).catch(() => undefined)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(kind === "all" || kind === "documents") && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Documents</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedDocumentIds(filteredData.documents.map((d) => d.id))}>Select all</Button>
            <Button variant="outline" onClick={() => setSelectedDocumentIds([])}>Clear</Button>
            <Button variant="outline" disabled={selectedDocumentIds.length === 0} onClick={exportSelectedDocuments}>Export selected CSV</Button>
            <Button disabled={batchSaving === "documents" || selectedDocumentIds.length === 0} onClick={() => batchUpdateDocuments("Approved").catch(() => undefined)}>Approve</Button>
            <Button variant="danger" disabled={batchSaving === "documents" || selectedDocumentIds.length === 0} onClick={() => batchUpdateDocuments("Rejected").catch(() => undefined)}>Reject</Button>
            <Button disabled={batchSaving === "documents" || selectedDocumentIds.length === 0} onClick={() => batchUpdateDocuments("Pending").catch(() => undefined)}>Pending</Button>
          </div>
          <div className="mt-3 space-y-2">
            {filteredData.documents.map((d) => (
              <div key={d.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <label className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={selectedDocumentIds.includes(d.id)} onChange={() => toggleSelected(d.id, selectedDocumentIds, setSelectedDocumentIds)} />
                  Select
                </label>
                <p className="font-medium">{d.doc_type}</p>
                <p>{d.driver_email || "-"}</p>
                <p>Status: {d.status} • Expiry: {d.expiry ? new Date(d.expiry).toLocaleDateString() : "-"}</p>
                {d.driver_id ? <Link href={`/admin/users/${d.driver_id}`}><Button variant="outline" className="mt-2">Open Driver</Button></Link> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["Approved", "Rejected", "Pending"] as const).map((status) => (
                    <Button
                      key={`${d.id}-${status}`}
                      variant="outline"
                      disabled={savingId === `doc-${d.id}`}
                      onClick={() => setDocumentStatus(d.id, status).catch(() => undefined)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
