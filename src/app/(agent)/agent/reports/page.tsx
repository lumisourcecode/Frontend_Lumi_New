"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Stats = { clientsEnrolled: number; ridesToday: number; inTransit: number; pendingApprovals: number };
type Booking = { id: string; pickup: string; dropoff: string; status: string; scheduled_at: string };

export default function PartnerReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [reportType, setReportType] = useState("operations");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Stats>("/partner/stats", undefined, session.accessToken).then(setStats).catch(() => {});
    apiJson<{ items: Booking[] }>("/partner/bookings", undefined, session.accessToken).then((r) => setBookings(r.items)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const dt = new Date(b.scheduled_at);
      if (from && dt < new Date(from)) return false;
      if (to && dt > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [bookings, from, to]);

  const completed = filtered.filter((b) => b.status === "completed").length;
  const onTimeRate = filtered.length ? Math.round((completed / filtered.length) * 1000) / 10 : 0;

  function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
    const headers = rows.length ? Object.keys(rows[0]) : ["id", "status"];
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

  function generate() {
    const rows = filtered.map((b) => ({
      booking_id: b.id,
      pickup: b.pickup,
      dropoff: b.dropoff,
      status: b.status,
      scheduled_at: b.scheduled_at,
      report_type: reportType,
    }));
    if (rows.length === 0) {
      setMsg("No data in selected range.");
      return;
    }
    setMsg(`Report ready (${rows.length} rows).`);
  }

  function exportCsv() {
    const rows = filtered.map((b) => ({
      booking_id: b.id,
      pickup: b.pickup,
      dropoff: b.dropoff,
      status: b.status,
      scheduled_at: b.scheduled_at,
    }));
    downloadCsv(`partner-report-${Date.now()}.csv`, rows);
    setMsg("CSV exported.");
  }

  function exportPdfFallback() {
    if (typeof window !== "undefined") {
      window.print();
    }
    setMsg("Opened print dialog as PDF export fallback.");
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#15206A] to-[#2A8DBD] text-white">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Measure utilization, on-time performance, spend, and care transport outcomes.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Total Trips</p><p className="text-2xl font-bold text-[#15206A]">{filtered.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Completion Rate</p><p className="text-2xl font-bold text-[#15206A]">{onTimeRate}%</p></Card>
        <Card><p className="text-xs text-slate-500">Clients Enrolled</p><p className="text-2xl font-bold text-emerald-700">{stats?.clientsEnrolled ?? "—"}</p></Card>
        <Card><p className="text-xs text-slate-500">In Transit</p><p className="text-2xl font-bold text-[#15206A]">{stats?.inTransit ?? "—"}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Report Builder</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
          </Select>
          <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="operations">Report Type: Operations</option>
            <option value="billing">Report Type: Billing</option>
            <option value="outcomes">Report Type: Client Outcomes</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={generate}>Generate Report</Button>
          <Button variant="outline" onClick={exportPdfFallback}>Export PDF</Button>
          <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        </div>
        {msg ? <p className="mt-2 text-xs text-slate-600">{msg}</p> : null}
        <div className="mt-3 space-y-2 text-sm">
          {filtered.slice(0, 20).map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 p-3">
              {b.pickup} {"->"} {b.dropoff} • {new Date(b.scheduled_at).toLocaleString()} • {b.status}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
