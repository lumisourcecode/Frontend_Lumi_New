"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Driver = { id: string; email: string; full_name?: string; phone?: string; vehicle_rego?: string; verification_status?: string; is_active?: boolean };

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "verification" | "recent">("verification");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Driver[] }>("/admin/drivers", undefined, session.accessToken)
      .then((r) => setDrivers(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approvedCount = drivers.filter((d) => d.verification_status === "Approved").length;
  const filtered = drivers.filter((d) => {
    const s = search.toLowerCase();
    const matchSearch = !s || (d.full_name || d.email).toLowerCase().includes(s) || (d.email || "").toLowerCase().includes(s) || (d.vehicle_rego || "").toLowerCase().includes(s);
    const matchStatus = status === "all" || (d.verification_status || "Pending") === status;
    const matchActive = activityFilter === "all" || (activityFilter === "active" ? d.is_active !== false : d.is_active === false);
    return matchSearch && matchStatus && matchActive;
  }).sort((a, b) => {
    if (sortBy === "recent") return String(b.id).localeCompare(String(a.id));
    if (sortBy === "name") return String(a.full_name || a.email).localeCompare(String(b.full_name || b.email));
    return String(a.verification_status || "").localeCompare(String(b.verification_status || ""));
  });

  async function setDriverActive(userId: string, isActive: boolean) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setSavingId(userId);
    setMsg("");
    try {
      await apiJson(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      }, session.accessToken);
      setDrivers((prev) => prev.map((d) => (d.id === userId ? { ...d, is_active: isActive } : d)));
      setMsg(`Driver ${isActive ? "activated" : "suspended"}.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to update driver status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-[var(--color-primary)] text-white">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Manage drivers, verification status, and profiles.
          </p>
        </div>
        <Link href="/admin/users?create=driver">
          <Button className="bg-white text-[var(--color-primary)] hover:bg-slate-100">+ Add Driver</Button>
        </Link>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Total Drivers</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : drivers.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Approved</p>
          <p className="text-2xl font-bold text-emerald-700">{loading ? "—" : approvedCount}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Driver Directory</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Search driver" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All verification statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </Select>
          <Select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
            <option value="all">All account states</option>
            <option value="active">Active accounts</option>
            <option value="suspended">Suspended accounts</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="verification">Sort: Verification</option>
            <option value="name">Sort: Name</option>
            <option value="recent">Sort: Recently Added</option>
          </Select>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No drivers yet.{" "}
              <Link href="/admin/users?create=driver" className="font-medium text-[var(--color-primary)] underline">
                Add Driver
              </Link>
              {" or "}
              <Link href="/admin/enrollments" className="font-medium text-[var(--color-primary)] underline">
                Enrollments
              </Link>
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Vehicle</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Account</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">
                      <Link href={`/admin/users/${d.id}`} className="text-[var(--color-primary)] hover:underline">
                        {d.full_name || d.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/users/${d.id}`} className="text-[var(--color-primary)] hover:underline">
                        {d.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{d.vehicle_rego || "-"}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={d.verification_status === "Approved" ? "certified" : d.verification_status === "Rejected" ? "danger" : "pending"}>
                        {d.verification_status || "Pending"}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3">{d.is_active === false ? "Suspended" : "Active"}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/users/${d.id}`}>
                          <Button variant="outline">View / Edit</Button>
                        </Link>
                        <Button
                          variant={d.is_active === false ? "primary" : "danger"}
                          disabled={savingId === d.id}
                          onClick={() => setDriverActive(d.id, d.is_active === false)}
                        >
                          {d.is_active === false ? "Activate" : "Suspend"}
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
