"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Progress } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Stats = {
  ridersCount: number;
  driversCount: number;
  pendingEnrollmentsCount: number;
  bookingsCount: number;
  pendingTripsCount: number;
  activeTripsCount: number;
};

function buildPriorityQueue(stats: Stats | null) {
  const items: Array<{ id: string; title: string; detail: string; tone: "danger" | "pending"; action: string; actionLabel: string }> = [];
  if (stats && stats.pendingEnrollmentsCount > 0) {
    items.push({
      id: "ENR",
      title: "Driver enrollments pending",
      detail: `${stats.pendingEnrollmentsCount} driver(s) awaiting approval.`,
      tone: "danger",
      action: "/admin/enrollments",
      actionLabel: "Open enrollments",
    });
  }
  if (stats && stats.pendingTripsCount > 0) {
    items.push({
      id: "TRP",
      title: "Trips need driver assignment",
      detail: `${stats.pendingTripsCount} trip(s) pending assignment.`,
      tone: "pending",
      action: "/admin/dispatch",
      actionLabel: "Assign trips",
    });
  }
  if (items.length === 0 && stats) {
    items.push({
      id: "OK",
      title: "All clear",
      detail: "No urgent actions. Check Activity or Reports for details.",
      tone: "pending",
      action: "/admin/activity",
      actionLabel: "View activity",
    });
  }
  return items;
}

const quickActionsList = [
  { title: "Create user", href: "/admin/users" },
  { title: "Approve driver", href: "/admin/enrollments" },
  { title: "Manual booking", href: "/admin/dispatch" },
  { title: "Assign trips", href: "/admin/dispatch" },
  { title: "Activity log", href: "/admin/activity" },
  { title: "Billing", href: "/admin/billing" },
];

const automationHealth = [
  { label: "Auto invoicing", value: 91 },
  { label: "Reminder delivery", value: 95 },
  { label: "Driver onboarding pipeline", value: 78 },
  { label: "Compliance sync", value: 88 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    apiJson<Stats>("/admin/stats", undefined, session.accessToken)
      .then(setStats)
      .catch(() => {});
  }, [session?.accessToken]);

  const kpis = stats ? [
    { label: "Riders", value: String(stats.ridersCount), note: "Registered" },
    { label: "Drivers", value: String(stats.driversCount), note: `${stats.pendingEnrollmentsCount} pending enrollment` },
    { label: "Bookings", value: String(stats.bookingsCount), note: "Total" },
    { label: "Pending Trips", value: String(stats.pendingTripsCount), note: "Need driver" },
    { label: "Active Trips", value: String(stats.activeTripsCount), note: "In progress" },
  ] : [];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[var(--color-primary)] via-indigo-800 to-indigo-950 text-white">
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <div>
            <h1 className="text-2xl font-bold">Enterprise Admin Workspace</h1>
            <p className="mt-2 max-w-3xl text-sm text-indigo-100">
              Unified control center for dispatch, billing, user access, driver enrollment, partner
              operations, compliance, and reporting.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button>Run End-of-Day Automation</Button>
              <Button variant="soft">Download Operations Snapshot</Button>
            </div>
          </div>
          <Card className="border border-white/20 bg-white/10 p-4 text-white shadow-none">
            <p className="text-xs uppercase tracking-wide text-indigo-100">Live Operational Status</p>
            <p className="mt-2 text-2xl font-bold">Stable</p>
            <p className="mt-1 text-xs text-indigo-100">All critical systems healthy. 3 medium-priority actions pending.</p>
          </Card>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.length ? kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{kpi.value}</p>
            <p className="text-xs text-slate-600">{kpi.note}</p>
          </Card>
        )) : (
          <Card><p className="text-sm text-slate-600">Loading stats...</p></Card>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Priority Queue</h2>
          <div className="mt-3 space-y-3">
            {buildPriorityQueue(stats).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <Badge tone={item.tone}>{item.id}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                <Link href={item.action} className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)]">
                  {item.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Quick Actions</h2>
          <div className="mt-3 grid gap-2">
            {quickActionsList.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {action.title}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Automation Health</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {automationHealth.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">{item.value}%</p>
              </div>
              <div className="mt-2">
                <Progress value={item.value} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
