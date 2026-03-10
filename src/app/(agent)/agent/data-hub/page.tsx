"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

export default function PartnerDataHubPage() {
  const [exportType, setExportType] = useState("clients");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [itemsCount, setItemsCount] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Array<unknown> }>("/partner/clients", undefined, session.accessToken)
      .then((r) => setItemsCount(r.items.length))
      .catch(() => setItemsCount(null));
  }, []);

  async function exportData() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    try {
      if (exportType === "clients") {
        const data = await apiJson<{ items: Array<Record<string, unknown>> }>("/partner/clients", undefined, session.accessToken);
        const blob = new Blob([JSON.stringify(data.items, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "partner-clients.json";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await apiJson<{ items: Array<Record<string, unknown>> }>("/partner/bookings", undefined, session.accessToken);
        const blob = new Blob([JSON.stringify(data.items, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "partner-bookings.json";
        a.click();
        URL.revokeObjectURL(url);
      }
      setMsg("Export generated.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#112161] to-[#2A85BD] text-white">
        <h1 className="text-2xl font-bold">Data Hub</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Centralize imports, exports, client datasets, and audit-safe data sharing.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Import Data</h2>
          <div className="mt-3 grid gap-3">
            <Select>
              <option>Import Type: Client Master List</option>
              <option>Import Type: Weekly Roster</option>
              <option>Import Type: Facility Contacts</option>
            </Select>
            <Input type="file" />
            <Textarea placeholder="Column mapping notes" />
            <Button>Validate & Import</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Export Data</h2>
          <div className="mt-3 grid gap-3">
            <Select value={exportType} onChange={(e) => setExportType(e.target.value)}>
              <option value="clients">Export: Full Client Registry</option>
              <option value="bookings">Export: Trip History Pack</option>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button onClick={exportData}>Generate Export File</Button>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Data Governance</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Known records in registry: {itemsCount ?? "—"}</div>
          <div className="rounded-xl border border-slate-200 p-3">Date filter applied: {from || "N/A"} to {to || "N/A"}</div>
          <div className="rounded-xl border border-slate-200 p-3">PII access scope: Organization Admin + Compliance Officer</div>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>
    </div>
  );
}
