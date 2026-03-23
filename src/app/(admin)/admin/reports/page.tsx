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
  const [reportType, setReportType] = useState("operations");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState("csv");
  const [delivery, setDelivery] = useState("download");
  const [msg, setMsg] = useState("");

  function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
    const headers = rows.length ? Object.keys(rows[0]) : ["metric", "value"];
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function runReport() {
    const rows = [
      { metric: "ridersCount", value: summary?.ridersCount ?? 0 },
      { metric: "driversCount", value: summary?.driversCount ?? 0 },
      { metric: "bookingsCount", value: summary?.bookingsCount ?? 0 },
      { metric: "completedTripsCount", value: summary?.completedTripsCount ?? 0 },
      { metric: "pendingDocsCount", value: summary?.pendingDocsCount ?? 0 },
      { metric: "activityLast7Days", value: summary?.activityLast7Days ?? 0 },
      { metric: "reportType", value: reportType },
      { metric: "from", value: from || "-" },
      { metric: "to", value: to || "-" },
    ];
    if (delivery === "download") {
      downloadCsv(`admin-report-${reportType}-${Date.now()}.csv`, rows);
      setMsg("Report generated and downloaded.");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_reports_last_job", JSON.stringify({ reportType, from, to, format, delivery, at: Date.now() }));
    }
    setMsg("Report scheduled in local queue (fallback).");
  }

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
        <p className="mt-1 text-sm text-slate-600">Export and schedule reports with CSV fallback for immediate operations.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="operations">Type: Operations Summary</option>
            <option value="billing">Type: Billing & Receivables</option>
            <option value="compliance">Type: Compliance</option>
            <option value="partner">Type: Partner Performance</option>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="pdf">Format: PDF</option>
            <option value="csv">Format: CSV</option>
            <option value="xlsx">Format: XLSX</option>
          </Select>
          <Select value={delivery} onChange={(e) => setDelivery(e.target.value)}>
            <option value="download">Delivery: Download now</option>
            <option value="email">Delivery: Email stakeholders</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={runReport}>Generate</Button>
          <Button variant="outline" onClick={runReport}>Schedule Weekly</Button>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
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
