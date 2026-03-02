"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Agent = { id: string; email: string; org_name?: string; contact_name?: string; is_active?: boolean; created_at?: string };

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Agent[] }>("/admin/agents", undefined, session.accessToken)
      .then((r) => setAgents(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-[var(--color-primary)] text-white">
        <div>
          <h1 className="text-2xl font-bold">Agent Review & Portfolios</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Monitor agent performance, client assignments, SLA compliance.
          </p>
        </div>
        <Link href="/admin/users?create=agent">
          <Button className="bg-white text-[var(--color-primary)] hover:bg-slate-100">+ Add Agent</Button>
        </Link>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Active Agents</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : agents.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : agents.length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Agent Coaching Review</h2>
        <p className="mt-1 text-sm text-slate-600">Select an agent below to view profile and assign tasks.</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Agent Portfolio Summary</h2>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : agents.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No agents yet.{" "}
              <Link href="/admin/users?create=agent" className="font-medium text-[var(--color-primary)] underline">
                Add Agent
              </Link>
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Agent</th>
                  <th className="py-2 pr-3">Org</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">{a.contact_name || a.email}</td>
                    <td className="py-2 pr-3">{a.org_name || "-"}</td>
                    <td className="py-2 pr-3">{a.contact_name || "-"}</td>
                    <td className="py-2 pr-3">{a.email}</td>
                    <td className="py-2">
                      <Link href={`/admin/users/${a.id}`}>
                        <Button variant="outline">View Profile</Button>
                      </Link>
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
