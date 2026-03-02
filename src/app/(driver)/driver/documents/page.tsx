"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Doc = { id: string; doc_type: string; status: string; expiry: string | null };

const DOC_TYPES = [
  "Driver License (Australian)",
  "NDIS Worker Screening Check",
  "National Police Check",
  "Manual Handling Certificate",
  "CPR / First Aid Certificate",
  "Vehicle Registration",
  "Comprehensive Insurance",
];

export default function DriverDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docType, setDocType] = useState("Driver License");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Doc[] }>("/driver/documents", undefined, session.accessToken)
      .then((r) => setDocs(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addDocument() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setSubmitting(true);
    setMsg("");
    try {
      await apiJson("/driver/documents", {
        method: "POST",
        body: JSON.stringify({ docType, expiry: expiry || null }),
      }, session.accessToken);
      setMsg("Document added.");
      setDocType("Driver License");
      setExpiry("");
      const r = await apiJson<{ items: Doc[] }>("/driver/documents", undefined, session.accessToken);
      setDocs(r.items);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#151E6C] to-[#3D96C8] text-white">
        <h1 className="text-2xl font-bold">Documents Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Upload and manage compliance documents, reminders, and verification status.
        </p>
        <Link href="/driver/onboard" className="mt-2 inline-block text-sm text-indigo-200 underline">
          Complete onboarding &rarr;
        </Link>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Upload Document</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="Expiry" />
        </div>
        <Button className="mt-3" disabled={submitting} onClick={addDocument}>
          {submitting ? "Submitting..." : "Submit for Verification"}
        </Button>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Document Status</h2>
        <div className="mt-3 space-y-2 text-sm">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : docs.length === 0 ? (
            <p className="text-slate-500">No documents yet. Add one above or complete enrollment.</p>
          ) : (
            docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span>{d.doc_type}{d.expiry ? ` - Expires ${d.expiry}` : ""}</span>
                <Badge
                  tone={
                    d.status === "Approved" ? "certified" : d.status === "Rejected" ? "danger" : "pending"
                  }
                >
                  {d.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
