"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Doc = {
  id: string;
  doc_type: string;
  status: string;
  expiry: string | null;
  admin_notes?: string | null;
  driver_name?: string;
  driver_email?: string;
};

const DOC_STATUSES = ["Pending", "In Progress", "Needs More Information", "Approved", "Rejected"] as const;

export default function AdminCompliancePage() {
  const [items, setItems] = useState<Doc[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState<Record<string, { status: string; notes: string }>>({});

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Doc[]; totalDocs: number; pendingCount: number; expiringSoonCount: number }>(
      "/admin/compliance",
      undefined,
      session.accessToken,
    )
      .then((r) => {
        setItems(r.items);
        setTotalDocs(r.totalDocs);
        setPendingCount(r.pendingCount);
        setExpiringSoon(r.expiringSoonCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function verifyDoc(docId: string, status: string, adminNotes?: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setVerifying(docId);
    try {
      await apiJson(`/admin/documents/${docId}/verify`, {
        method: "POST",
        body: JSON.stringify({ status, adminNotes: adminNotes || undefined }),
      }, session.accessToken);
      setItems((prev) => prev.map((d) => (d.id === docId ? { ...d, status, admin_notes: adminNotes ?? d.admin_notes } : d)));
      if (status === "Approved" || status === "Rejected") {
        setPendingCount((c) => Math.max(0, c - 1));
      }
      setStatusNotes((prev) => ({ ...prev, [docId]: { status: "", notes: "" } }));
    } catch {
      // ignore
    } finally {
      setVerifying(null);
    }
  }

  const pctUpToDate = totalDocs > 0 ? Math.round(((totalDocs - pendingCount) / totalDocs) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Compliance & Governance</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track audits, export mandatory files, and monitor workforce/document compliance.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Driver Documents</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{pctUpToDate}%</p>
          <p className="text-xs text-slate-600">Up to date ({totalDocs - pendingCount}/{totalDocs})</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pending Review</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{pendingCount}</p>
          <p className="text-xs text-slate-600">Needs approval</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Expiring Soon (30d)</p>
          <p className="text-2xl font-bold text-amber-700">{expiringSoon}</p>
          <p className="text-xs text-slate-600">Needs renewal</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Export Files</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled>Generate PRODA Bulk Claim CSV (coming soon)</Button>
          <Button variant="outline" disabled>Export MPTP DCP Trip Files</Button>
          <Link href="/admin/activity">
            <Button variant="outline">View Audit Log</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Driver Documents</h2>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No driver documents yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Driver</th>
                  <th className="py-2 pr-3">Doc Type</th>
                  <th className="py-2 pr-3">Expiry</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-3">{d.driver_name || d.driver_email || "-"}</td>
                    <td className="py-2 pr-3">{d.doc_type}</td>
                    <td className="py-2 pr-3">{d.expiry ? new Date(d.expiry).toLocaleDateString() : "-"}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={d.status === "Approved" ? "certified" : d.status === "Rejected" ? "danger" : "pending"}>
                        {d.status}
                      </Badge>
                      {d.admin_notes && (
                        <p className="mt-1 text-xs text-slate-500" title={d.admin_notes}>{d.admin_notes.slice(0, 40)}{d.admin_notes.length > 40 ? "…" : ""}</p>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Select
                          value={statusNotes[d.id]?.status ?? d.status}
                          onChange={(e) => setStatusNotes((prev) => ({ ...prev, [d.id]: { ...(prev[d.id] || {}), status: e.target.value } }))}
                          className="w-44"
                        >
                          {DOC_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                        <Input
                          placeholder="Admin notes (e.g. needs clearer photo)"
                          value={statusNotes[d.id]?.notes ?? ""}
                          onChange={(e) => setStatusNotes((prev) => ({ ...prev, [d.id]: { ...prev[d.id], notes: e.target.value } }))}
                          className="min-w-[180px]"
                        />
                        <Button
                          disabled={verifying === d.id}
                          onClick={() => verifyDoc(d.id, statusNotes[d.id]?.status || d.status, statusNotes[d.id]?.notes)}
                        >
                          Update
                        </Button>
                      </div>
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
