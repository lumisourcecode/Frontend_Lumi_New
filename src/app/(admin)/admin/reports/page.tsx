"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Summary = {
  ridersCount: number;
  driversCount: number;
  bookingsCount: number;
  completedTripsCount: number;
  pendingDocsCount: number;
  activityLast7Days: number;
};

const reportLibrary = [
  { name: "Operations Executive Summary", frequency: "Daily", owner: "Operations", includes: "Trips, delays, incidents, driver utilization", link: "/admin/dashboard" },
  { name: "Billing + Receivables Report", frequency: "Daily", owner: "Finance", includes: "Invoices, aging, payment success rate", link: "/admin/billing" },
  { name: "Compliance Control Report", frequency: "Weekly", owner: "Compliance", includes: "Documents, training, audit exceptions", link: "/admin/compliance" },
  { name: "Partner Portfolio Performance", frequency: "Weekly", owner: "Customer Success", includes: "Clients per partner, SLA, retention risk", link: "/admin/users?create=partner" },
];

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Summary>("/admin/reports/summary", undefined, session.accessToken)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Central reporting workspace for operational, financial, compliance, and customer performance data.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Riders</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : summary?.ridersCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Drivers</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : summary?.driversCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Completed Trips</p>
          <p className="text-2xl font-bold text-emerald-700">{loading ? "—" : summary?.completedTripsCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Activity (7d)</p>
          <p className="text-2xl font-bold text-amber-700">{loading ? "—" : summary?.activityLast7Days ?? 0}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Generate Report</h2>
        <p className="mt-1 text-sm text-slate-600">Export and schedule reports. Full export coming soon.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Select>
            <option>Type: Operations Summary</option>
            <option>Type: Billing & Receivables</option>
            <option>Type: Compliance</option>
            <option>Type: Partner Performance</option>
          </Select>
          <Input type="date" />
          <Input type="date" />
          <Select>
            <option>Format: PDF</option>
            <option>Format: CSV</option>
            <option>Format: XLSX</option>
          </Select>
          <Select>
            <option>Delivery: Download now</option>
            <option>Delivery: Email stakeholders</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled>Generate (coming soon)</Button>
          <Button variant="outline" disabled>Schedule Weekly</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Report Library</h2>
        <div className="mt-3 space-y-3">
          {reportLibrary.map((report) => (
            <div key={report.name} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{report.name}</p>
                <Badge tone="certified">{report.frequency}</Badge>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                <p>Owner: {report.owner}</p>
                <p className="md:col-span-2">Includes: {report.includes}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={report.link}>
                  <Button variant="outline">Open Dashboard</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
