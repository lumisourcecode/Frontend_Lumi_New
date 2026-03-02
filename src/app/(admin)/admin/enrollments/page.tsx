"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Enrollment = {
  id: string;
  user_id: string;
  status: string;
  full_name: string;
  phone: string;
  vehicle_rego: string;
  notes: string;
  email: string;
  created_at: string;
  verification_stage?: string;
  admin_notes?: string | null;
  documents?: Array<{ id: string; doc_type: string; status: string; expiry: string }>;
};

type Interest = { id: string; full_name: string; email: string; phone: string; role_type: string; suburb: string; vehicle_info: string; notes: string; created_at: string };

export default function AdminEnrollmentsPage() {
  const [tab, setTab] = useState<"pending" | "all" | "interest">("pending");
  const [items, setItems] = useState<Enrollment[]>([]);
  const [interestItems, setInterestItems] = useState<Interest[]>([]);
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [verificationStage, setVerificationStage] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) {
      setError("Please login as admin.");
      return;
    }
    if (tab === "interest") {
      apiJson<{ items: Interest[] }>("/admin/driver-interest", undefined, session.accessToken)
        .then((r) => setInterestItems(r.items))
        .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
      return;
    }
    const url = tab === "pending" ? "/admin/enrollments?status=pending" : "/admin/enrollments";
    apiJson<{ items: Enrollment[] }>(url, undefined, session.accessToken)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [tab, session?.accessToken]);

  async function review(id: string, status: "approved" | "rejected") {
    if (!session?.accessToken) return;
    try {
      await apiJson(`/admin/enrollments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes: reviewNotes[id] || null, adminNotes: adminNotes[id] || null }),
      }, session.accessToken);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function updateStage(id: string) {
    if (!session?.accessToken) return;
    const stage = verificationStage[id] || (items.find((x) => x.id === id)?.verification_stage ?? "profile_review");
    try {
      await apiJson(`/admin/enrollments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ verificationStage: stage, adminNotes: adminNotes[id] || null }),
      }, session.accessToken);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, verification_stage: stage, admin_notes: adminNotes[id] || x.admin_notes } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  const pendingCount = items.filter((x) => x.status === "pending").length;

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Driver Enrollment Requests</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Review driver applications, documents, and approve or reject.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{pendingCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total Applications</p>
          <p className="text-2xl font-bold text-slate-700">{items.length}</p>
        </Card>
      </div>

      <Card>
        <div className="flex gap-2">
          <Button variant={tab === "pending" ? "primary" : "outline"} onClick={() => setTab("pending")}>
            Pending
          </Button>
          <Button variant={tab === "all" ? "primary" : "outline"} onClick={() => setTab("all")}>
            All
          </Button>
          <Button variant={tab === "interest" ? "primary" : "outline"} onClick={() => setTab("interest")}>
            Driver Interest (Pre-reg)
          </Button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        {tab === "interest" ? (
          <div className="mt-3 space-y-3">
            {interestItems.map((i) => (
              <div key={i.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{i.full_name || i.email}</p>
                <p className="text-xs text-slate-500">{i.email} | {i.phone || "-"} | {i.role_type || "-"} | {i.suburb || "-"}</p>
                {i.vehicle_info && <p className="text-sm text-slate-600">Vehicle: {i.vehicle_info}</p>}
                {i.notes && <p className="mt-1 text-sm text-slate-600">{i.notes}</p>}
                <p className="mt-1 text-xs text-slate-400">{new Date(i.created_at).toLocaleString()}</p>
              </div>
            ))}
            {interestItems.length === 0 && <p className="text-sm text-slate-500">No driver interest submissions yet.</p>}
          </div>
        ) : (
        <div className="mt-3 space-y-3">
          {items.map((e) => (
            <div key={e.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{e.full_name || e.email}</p>
                  <p className="text-xs text-slate-500">{e.email} | {e.phone || "-"} | Vehicle: {e.vehicle_rego || "-"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={e.status === "approved" ? "certified" : e.status === "rejected" ? "danger" : "pending"}>
                    {e.status}
                  </Badge>
                  {e.verification_stage && (
                    <span className="text-xs text-slate-500">{e.verification_stage.replace(/_/g, " ")}</span>
                  )}
                </div>
              </div>
              {e.admin_notes && <p className="mt-2 rounded bg-amber-50 p-2 text-sm text-amber-800">{e.admin_notes}</p>}
              {e.notes && !e.admin_notes && <p className="mt-2 text-sm text-slate-600">{e.notes}</p>}
              {e.documents && e.documents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {e.documents.map((d) => (
                    <Badge key={d.id} tone={d.status === "Verified" ? "certified" : "pending"}>
                      {d.doc_type}: {d.status}
                    </Badge>
                  ))}
                </div>
              )}
              {e.status === "pending" && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label className="block text-xs text-slate-500">Verification stage</label>
                      <Select
                        value={verificationStage[e.id] ?? e.verification_stage ?? "profile_review"}
                        onChange={(ev) => setVerificationStage((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                        className="mt-1"
                      >
                        <option value="profile_review">Profile review</option>
                        <option value="documents_review">Documents review</option>
                        <option value="under_review">Under review</option>
                      </Select>
                    </div>
                    <Button variant="outline" onClick={() => updateStage(e.id)}>Update stage</Button>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500">Admin notes (driver will be notified)</label>
                    <Textarea
                      placeholder="Notes for driver (e.g. document X needs clearer photo)"
                      className="mt-1 min-h-16"
                      value={adminNotes[e.id] ?? e.admin_notes ?? ""}
                      onChange={(ev) => setAdminNotes((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Textarea
                      placeholder="Internal review notes"
                      className="min-h-12"
                      value={reviewNotes[e.id] ?? ""}
                      onChange={(ev) => setReviewNotes((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                    />
                    <Button onClick={() => review(e.id, "approved")}>Approve</Button>
                    <Button variant="danger" onClick={() => review(e.id, "rejected")}>Reject</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </Card>
    </div>
  );
}
