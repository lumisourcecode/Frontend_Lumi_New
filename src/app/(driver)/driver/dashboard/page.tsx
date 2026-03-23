"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
} from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Stats = { tripsToday: number; totalTrips: number; inProgress: number };

export default function DriverDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [manifest, setManifest] = useState<Array<{ id: string; pickup: string; dropoff: string; state: string }>>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; payload: Record<string, unknown>; read_at: string | null; created_at: string }>>([]);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ verificationStatus: string; enrollment: { status: string } | null }>("/driver/onboarding", undefined, session.accessToken)
      .then((d) => {
        const ok = d.verificationStatus === "Approved" || d.enrollment?.status === "approved";
        setVerified(ok);
        if (!ok) router.replace("/driver/onboard");
      })
      .catch(() => setVerified(false));
  }, [router]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken || verified !== true) return;
    apiJson<Stats>("/driver/stats", undefined, session.accessToken)
      .then(setStats)
      .catch(() => {});
    apiJson<{ items: typeof manifest }>("/driver/manifest", undefined, session.accessToken)
      .then((r) => setManifest(r.items.slice(0, 5)))
      .catch(() => {});
    apiJson<{ items: typeof notifications }>("/driver/notifications", undefined, session.accessToken)
      .then((r) => setNotifications(r.items || []))
      .catch(() => {});
  }, [verified]);

  if (verified === false || verified === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#12195E] via-[#25309E] to-[#0072A8] text-white">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Daily operations overview with instant access to trips, earnings, safety, documents, and support.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Online Time</p>
          <p className="text-2xl font-bold text-[#12195E]">—</p>
          <p className="text-xs text-slate-600">Shift tracking coming soon</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Trips Today</p>
          <p className="text-2xl font-bold text-[#12195E]">{stats?.tripsToday ?? "—"}</p>
          <p className="text-xs text-slate-600">{stats?.inProgress ?? 0} in progress</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total Trips</p>
          <p className="text-2xl font-bold text-[#12195E]">{stats?.totalTrips ?? "—"}</p>
          <p className="text-xs text-slate-600">All time</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-[#12195E]">{stats?.inProgress ?? "—"}</p>
          <p className="text-xs text-slate-600">Active trips</p>
        </Card>
      </div>

      {notifications.length > 0 && (
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Notifications</h3>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`rounded-xl border p-2 text-sm ${n.read_at ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50"}`}>
                <p className="font-medium">{n.type.replace(/_/g, " ")}</p>
                {n.payload?.pickup != null ? <p className="text-xs text-slate-600">{String(n.payload.pickup)} → {String(n.payload.dropoff)}</p> : null}
                <p className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <Link href="/driver/manifest" className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)]">View Manifest →</Link>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Demand & Hotspots</h2>
          <div className="mt-3 h-64 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            Heatmap placeholder with surge/demand-style zones and recommended positioning.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Go to Recommended Zone</Button>
            <Button variant="outline">Set Destination Filter</Button>
            <Button variant="outline">Enable Auto-Accept (Safe Mode)</Button>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Quick Actions</h3>
          <div className="mt-3 grid gap-2">
            <Button>Start Shift</Button>
            <Button variant="outline">Take Break</Button>
            <Link href="/driver/manifest">
              <Button variant="outline" className="w-full">Open Manifest</Button>
            </Link>
            <Button variant="outline">Instant Cashout</Button>
            <Button variant="danger">SOS Safety</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Upcoming Trips</h3>
          <div className="mt-3 space-y-2 text-sm">
            {manifest.length === 0 ? (
              <p className="text-slate-500">No trips yet. Check Available Trips in Manifest.</p>
            ) : (
              manifest.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-200 p-3">
                  {t.pickup} → {t.dropoff} | <Badge tone="default">{t.state}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Driver Assistant</h3>
          <div className="mt-3 grid gap-3">
            <Input placeholder="Ask: best time to go online?" />
            <Select>
              <option>Recommendation: Stay in current zone</option>
              <option>Recommendation: Move 4km west</option>
            </Select>
            <Button variant="outline">Get Route Optimization Tip</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
