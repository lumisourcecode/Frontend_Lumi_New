"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Rider = { id: string; email: string; full_name?: string; phone?: string; ndis_id?: string; bookings_count?: string; is_active?: boolean };

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "bookings" | "recent">("name");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Rider[] }>("/admin/riders", undefined, session.accessToken)
      .then((r) => setRiders(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = riders.filter((r) => {
    const s = search.toLowerCase();
    const matchSearch = !s || (r.full_name || r.email).toLowerCase().includes(s) || (r.email || "").toLowerCase().includes(s);
    const matchStatus = status === "all" || (status === "active" ? r.is_active !== false : r.is_active === false);
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "bookings") return Number(b.bookings_count ?? 0) - Number(a.bookings_count ?? 0);
    if (sortBy === "recent") return String(b.id).localeCompare(String(a.id));
    return String(a.full_name || a.email).localeCompare(String(b.full_name || b.email));
  });

  async function setRiderActive(userId: string, isActive: boolean) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setSavingId(userId);
    setMsg("");
    try {
      await apiJson(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      }, session.accessToken);
      setRiders((prev) => prev.map((r) => (r.id === userId ? { ...r, is_active: isActive } : r)));
      setMsg(`Rider ${isActive ? "activated" : "suspended"}.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to update rider status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-[var(--color-primary)] text-white">
        <div>
          <h1 className="text-2xl font-bold">Riders</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Manage riders, view bookings, and edit profiles.
          </p>
        </div>
        <Link href="/admin/users?create=rider">
          <Button className="bg-white text-[var(--color-primary)] hover:bg-slate-100">+ Add Rider</Button>
        </Link>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Total Riders</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{loading ? "—" : riders.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{loading ? "—" : riders.filter((r) => r.is_active !== false).length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Rider Directory</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Search rider" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="suspended">Suspended only</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="name">Sort: Name</option>
            <option value="bookings">Sort: Bookings</option>
            <option value="recent">Sort: Recently Added</option>
          </Select>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              No riders yet.{" "}
              <Link href="/admin/users?create=rider" className="font-medium text-[var(--color-primary)] underline">
                Add Rider
              </Link>
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">NDIS</th>
                  <th className="py-2 pr-3">Bookings</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">
                      <Link href={`/admin/users/${r.id}`} className="text-[var(--color-primary)] hover:underline">
                        {r.full_name || r.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/users/${r.id}`} className="text-[var(--color-primary)] hover:underline">
                        {r.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{r.phone || "-"}</td>
                    <td className="py-2 pr-3">{r.ndis_id || "-"}</td>
                    <td className="py-2 pr-3">{r.bookings_count ?? "0"}</td>
                    <td className="py-2 pr-3">
                      {r.is_active === false ? "Suspended" : "Active"}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/users/${r.id}`}>
                          <Button variant="outline">View / Edit</Button>
                        </Link>
                        <Button
                          variant={r.is_active === false ? "primary" : "danger"}
                          disabled={savingId === r.id}
                          onClick={() => setRiderActive(r.id, r.is_active === false)}
                        >
                          {r.is_active === false ? "Activate" : "Suspend"}
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
