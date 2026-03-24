"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Activity = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  created_at: string;
  email: string;
};

type ActivitySnapshot = { path: string; items: Activity[]; error: string };

export default function AdminActivityPage() {
  const session = getAuthSession();
  const [snapshot, setSnapshot] = useState<ActivitySnapshot | null>(null);
  const [actionQ, setActionQ] = useState("");
  const [entityType, setEntityType] = useState("");
  const [userId, setUserId] = useState("");
  const [limit, setLimit] = useState(100);

  const activityPath = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(Math.min(500, Math.max(1, limit))));
    const aq = actionQ.trim();
    if (aq) p.set("action", aq);
    const et = entityType.trim();
    if (et) p.set("entityType", et);
    const uid = userId.trim();
    if (uid) p.set("userId", uid);
    return `/admin/activity?${p.toString()}`;
  }, [limit, actionQ, entityType, userId]);

  useEffect(() => {
    if (!session?.accessToken) return;
    let cancelled = false;
    apiJson<{ items: Activity[] }>(activityPath, undefined, session.accessToken, { timeoutMs: 90_000 })
      .then((r) => {
        if (!cancelled) {
          setSnapshot({ path: activityPath, items: r.items, error: "" });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setSnapshot({
            path: activityPath,
            items: [],
            error: e instanceof Error ? e.message : "Failed",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activityPath, session?.accessToken]);

  const inFlight = snapshot === null || snapshot.path !== activityPath;
  const items = inFlight && snapshot && snapshot.path !== activityPath ? snapshot.items : snapshot?.items ?? [];
  const error = inFlight ? "" : (snapshot?.error ?? "");
  const loading = inFlight;

  if (!session?.accessToken) {
    return (
      <div className="space-y-4">
        <Card className="bg-[var(--color-primary)] text-white">
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Who enrolled, which driver did what, ride requests, assignments.
          </p>
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
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Who enrolled, which driver did what, ride requests, assignments.
        </p>
      </Card>
      {error && !loading ? <Card><p className="text-red-600">{error}</p></Card> : null}
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input placeholder="Action contains…" value={actionQ} onChange={(e) => setActionQ(e.target.value)} />
          <Select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
            <option value="">Any entity type</option>
            <option value="booking">booking</option>
            <option value="trip">trip</option>
            <option value="user">user</option>
            <option value="document">document</option>
            <option value="support_ticket">support_ticket</option>
          </Select>
          <Input placeholder="User UUID (filter)" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <Select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="50">50 rows</option>
            <option value="100">100 rows</option>
            <option value="200">200 rows</option>
            <option value="500">500 rows</option>
          </Select>
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            onClick={() => {
              setActionQ("");
              setEntityType("");
              setUserId("");
            }}
          >
            Clear filters
          </Button>
        </div>
        <p className="mb-3 text-xs text-slate-500">Filters apply on the server. Invalid user UUID returns an error.</p>
        <div className="space-y-2">
          {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
          {!loading && items.length === 0 ? <p className="text-sm text-slate-500">No activity for these filters.</p> : null}
          {items.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm">
              <Badge tone="default">{a.action}</Badge>
              <Link href={`/admin/users/${a.user_id}`} className="text-[var(--color-primary)] hover:underline">{a.email || a.user_id}</Link>
              <span className="text-slate-500">{a.entity_type} {a.entity_id}</span>
              <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
              {a.payload && Object.keys(a.payload).length > 0 && (
                <pre className="mt-1 w-full overflow-x-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(a.payload)}</pre>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
