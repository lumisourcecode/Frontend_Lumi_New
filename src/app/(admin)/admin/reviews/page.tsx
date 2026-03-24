"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Trip = {
  id: string;
  state: string;
  rider_id?: string;
  driver_id?: string;
  rider_name?: string;
  driver_name?: string;
  pickup: string;
  dropoff: string;
  scheduled_at: string;
  mobility_needs?: string;
  admin_quality_notes?: string | null;
};

function NotesEditor({
  trip,
  accessToken,
  onSaved,
}: {
  trip: Trip;
  accessToken: string;
  onSaved: () => void;
}) {
  const [text, setText] = useState(trip.admin_quality_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setText(trip.admin_quality_notes ?? "");
  }, [trip.id, trip.admin_quality_notes]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/trips/${trip.id}/quality-notes`, {
        method: "PATCH",
        body: JSON.stringify({ adminQualityNotes: text }),
      }, accessToken);
      setMsg("Saved");
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-w-[200px] flex-col gap-1">
      <Textarea rows={2} className="text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder="Internal quality / coaching notes" />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save notes"}
        </Button>
        {msg ? <span className="text-xs text-slate-600">{msg}</span> : null}
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const searchParams = useSearchParams();
  const focusTrip = (searchParams.get("trip") ?? "").trim();

  const session = getAuthSession();
  const [snap, setSnap] = useState<{ fetchId: string; items: Trip[] } | null>(null);
  const [tick, setTick] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  const listPath = useMemo(() => {
    const p = new URLSearchParams();
    p.set("state", "Completed");
    p.set("limit", "200");
    if (focusTrip && /^[0-9a-f-]{36}$/i.test(focusTrip)) {
      p.set("tripId", focusTrip);
    } else if (debouncedQ) {
      if (/^[0-9a-f-]{36}$/i.test(debouncedQ)) p.set("tripId", debouncedQ);
      else p.set("q", debouncedQ);
    }
    return `/admin/trips?${p.toString()}`;
  }, [debouncedQ, focusTrip]);

  const fetchId = `${listPath}#${tick}`;

  useEffect(() => {
    if (!session?.accessToken) return;
    let cancelled = false;
    const id = fetchId;
    apiJson<{ items: Trip[] }>(listPath, undefined, session.accessToken, { timeoutMs: 90_000 })
      .then((r) => {
        if (!cancelled) setSnap({ fetchId: id, items: r.items });
      })
      .catch(() => {
        if (!cancelled) setSnap({ fetchId: id, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchId, listPath, session?.accessToken]);

  const loading = snap === null || snap.fetchId !== fetchId;
  const trips = loading && snap && snap.fetchId !== fetchId ? snap.items : snap?.items ?? [];
  const withNotes = trips.filter((t) => (t.admin_quality_notes ?? "").trim().length > 0).length;
  const bump = () => setTick((n) => n + 1);

  if (!session?.accessToken) {
    return (
      <div className="space-y-4">
        <Card className="bg-[var(--color-primary)] text-white">
          <h1 className="text-2xl font-bold">Driver Reviews & Quality</h1>
        </Card>
        <Card>
          <p className="text-red-600">Please login as admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Driver Reviews & Quality</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Completed trips with internal admin notes for coaching, compliance follow-up, and service quality. Rider star ratings can be added later.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Completed (loaded)</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : trips.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">With admin notes</p>
          <p className="text-2xl font-bold text-emerald-700">{loading ? "—" : withNotes}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Star ratings</p>
          <p className="text-2xl font-bold text-slate-600">Planned</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Deep link</p>
          <p className="text-sm text-slate-700">
            {focusTrip ? (
              <Link href={`/admin/trips-history?trip=${encodeURIComponent(focusTrip)}`} className="text-[var(--color-primary)] underline">
                Open in trip history
              </Link>
            ) : (
              "Use ?trip=UUID from bookings or trip list"
            )}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Search completed trips</h2>
        <div className="mt-3 max-w-xl">
          <Input placeholder="Rider, driver, route, or trip UUID" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Need a formal case? Log it under Support from the user profile or CRM.</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Completed trips</h2>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading…</p>
          ) : trips.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No completed trips match filters.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Driver</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Support needs</th>
                  <th className="py-2 pr-3">Scheduled</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 min-w-[220px]">Admin notes</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} className={`border-b ${focusTrip === t.id ? "bg-amber-50" : ""}`}>
                    <td className="py-2 pr-3 align-top font-mono text-xs">
                      <Link href={`/admin/reviews?trip=${encodeURIComponent(t.id)}`} className="text-[var(--color-primary)] hover:underline">
                        {String(t.id).slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-2 pr-3 align-top">
                      {t.rider_id ? (
                        <Link href={`/admin/users/${t.rider_id}`} className="text-[var(--color-primary)] hover:underline">
                          {t.rider_name || "—"}
                        </Link>
                      ) : (
                        t.rider_name || "—"
                      )}
                    </td>
                    <td className="py-2 pr-3 align-top">
                      {t.driver_id ? (
                        <Link href={`/admin/users/${t.driver_id}`} className="text-[var(--color-primary)] hover:underline">
                          {t.driver_name || "—"}
                        </Link>
                      ) : (
                        t.driver_name || "—"
                      )}
                    </td>
                    <td className="py-2 pr-3 align-top text-xs text-slate-600">{t.pickup} → {t.dropoff}</td>
                    <td className="py-2 pr-3 align-top text-xs">{t.mobility_needs || "—"}</td>
                    <td className="py-2 pr-3 align-top">{t.scheduled_at ? new Date(t.scheduled_at).toLocaleString() : "—"}</td>
                    <td className="py-2 pr-3 align-top">
                      <Badge tone="certified">{t.state}</Badge>
                    </td>
                    <td className="py-2 align-top">
                      <NotesEditor trip={t} accessToken={session.accessToken} onSaved={bump} />
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
