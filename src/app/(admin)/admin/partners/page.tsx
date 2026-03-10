"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Partner = {
  id: string;
  email: string;
  org_name?: string;
  contact_name?: string;
  clients_count?: number;
  is_active?: boolean;
  created_at?: string;
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [sort, setSort] = useState<"newest" | "clients_desc">("newest");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Partner[] }>("/admin/partners", undefined, session.accessToken)
      .then((r) => setPartners(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const base = partners.filter((partner) => {
      if (status === "active" && !partner.is_active) return false;
      if (status === "inactive" && partner.is_active) return false;
      if (!needle) return true;
      return [partner.email, partner.org_name ?? "", partner.contact_name ?? ""]
        .some((value) => value.toLowerCase().includes(needle));
    });
    if (sort === "clients_desc") {
      return [...base].sort((a, b) => Number(b.clients_count ?? 0) - Number(a.clients_count ?? 0));
    }
    return [...base].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
  }, [partners, search, sort, status]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-[var(--color-primary)] text-white">
        <div>
          <h1 className="text-2xl font-bold">Partner Review & Portfolios</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Monitor partner performance, client assignments, and SLA compliance.
          </p>
        </div>
        <Link href="/admin/users?create=partner">
          <Button className="bg-white text-[var(--color-primary)] hover:bg-slate-100">+ Add Partner</Button>
        </Link>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Active Partners</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">
            {loading ? "—" : partners.filter((partner) => partner.is_active).length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : partners.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-amber-700">
            {loading ? "—" : partners.filter((partner) => !partner.is_active).length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Managed Clients</p>
          <p className="text-2xl font-bold text-emerald-700">
            {loading ? "—" : partners.reduce((sum, partner) => sum + Number(partner.clients_count ?? 0), 0)}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Partner Coaching Review</h2>
        <p className="mt-1 text-sm text-slate-600">Select a partner below to view profile and assign tasks.</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Partner Portfolio Summary</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search email/org/contact"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="newest">Newest first</option>
            <option value="clients_desc">Most clients first</option>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setSort("newest");
            }}
          >
            Clear Filters
          </Button>
        </div>
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No partners match current filters.{" "}
              <Link href="/admin/users?create=partner" className="font-medium text-[var(--color-primary)] underline">
                Add Partner
              </Link>
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Partner</th>
                  <th className="py-2 pr-3">Org</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Clients</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((partner) => (
                  <tr key={partner.id} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">{partner.contact_name || partner.email}</td>
                    <td className="py-2 pr-3">{partner.org_name || "-"}</td>
                    <td className="py-2 pr-3">{partner.contact_name || "-"}</td>
                    <td className="py-2 pr-3">{partner.clients_count ?? 0}</td>
                    <td className="py-2 pr-3">{partner.email}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={partner.is_active ? "certified" : "pending"}>
                        {partner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/partners/${partner.id}`}>
                          <Button variant="outline">Manage Workspace</Button>
                        </Link>
                        <Link href={`/admin/users/${partner.id}`}>
                          <Button variant="outline">View User</Button>
                        </Link>
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
