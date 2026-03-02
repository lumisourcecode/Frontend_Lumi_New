"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Driver = { id: string; email: string; full_name?: string; phone?: string; vehicle_rego?: string; verification_status?: string; is_active?: boolean };

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Driver[] }>("/admin/drivers", undefined, session.accessToken)
      .then((r) => setDrivers(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approvedCount = drivers.filter((d) => d.verification_status === "Approved").length;

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
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : drivers.length === 0 ? (
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
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">{d.full_name || d.email}</td>
                    <td className="py-2 pr-3">{d.email}</td>
                    <td className="py-2 pr-3">{d.vehicle_rego || "-"}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={d.verification_status === "Approved" ? "certified" : d.verification_status === "Rejected" ? "danger" : "pending"}>
                        {d.verification_status || "Pending"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Link href={`/admin/users/${d.id}`}>
                        <Button variant="outline">View / Edit</Button>
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
