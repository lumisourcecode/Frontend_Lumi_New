"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type UserRow = {
  id: string;
  email: string;
  is_active: boolean;
  roles?: string[];
  full_name?: string;
  phone?: string;
  ndis_id?: string;
  vehicle_rego?: string;
  verification_status?: string;
  org_name?: string;
  contact_name?: string;
  bookings_count?: number;
};

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const createParam = searchParams.get("create") as "rider" | "driver" | "agent" | null;
  const [tab, setTab] = useState<"all" | "riders" | "drivers" | "agents">(
    createParam && ["rider", "driver", "agent"].includes(createParam) ? (createParam + "s") as "riders" | "drivers" | "agents" : "all"
  );
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"rider" | "driver" | "agent" | "admin">(
    createParam && ["rider", "driver", "agent", "admin"].includes(createParam) ? createParam : "rider"
  );
  const [createFullName, setCreateFullName] = useState("");
  const [createMsg, setCreateMsg] = useState("");

  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) {
      setError("Please login as admin.");
      return;
    }
    const token = session.accessToken;
    const endpoints: Record<typeof tab, string> = {
      all: "/admin/users",
      riders: "/admin/riders",
      drivers: "/admin/drivers",
      agents: "/admin/agents",
    };
    setError("");
    apiJson<{ items: UserRow[] }>(endpoints[tab], undefined, token)
      .then((res) => setUsers(res.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [tab, session?.accessToken]);

  const activeCount = useMemo(() => users.filter((u) => u.is_active).length, [users]);

  async function createUser() {
    if (!session?.accessToken) return;
    setCreateMsg("");
    try {
      await apiJson(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            email: createEmail,
            password: createPassword,
            role: createRole,
            fullName: createFullName || undefined,
          }),
        },
        session.accessToken,
      );
      setCreateMsg("User created.");
      setCreateEmail("");
      setCreatePassword("");
      setCreateFullName("");
      setTab("all");
      apiJson<{ items: UserRow[] }>("/admin/users", undefined, session.accessToken).then((res) =>
        setUsers(res.items),
      );
    } catch (e) {
      setCreateMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Super admin creates all users. View riders, drivers, agents, and their info.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{users.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create User</h2>
        <p className="mt-1 text-xs text-slate-600">Only super admin (admin@lumiride.com) can create admin users.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Email" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
          <Select value={createRole} onChange={(e) => setCreateRole(e.target.value as typeof createRole)}>
            <option value="rider">Rider</option>
            <option value="driver">Driver</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </Select>
          <Input placeholder="Full name" value={createFullName} onChange={(e) => setCreateFullName(e.target.value)} />
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={createUser}>Create User</Button>
          {createMsg ? <span className="text-sm text-slate-600">{createMsg}</span> : null}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          {(["all", "riders", "drivers", "agents"] as const).map((t) => (
            <Button key={t} variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
              {t === "all" ? "All Users" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Role / Info</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 pr-3">
                    <p className="font-medium text-slate-900">{user.full_name || user.email.split("@")[0]}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-2 pr-3">
                    {user.roles ? user.roles.join(", ") : null}
                    {user.ndis_id ? ` NDIS: ${user.ndis_id}` : null}
                    {user.vehicle_rego ? ` Rego: ${user.vehicle_rego}` : null}
                    {user.org_name ? ` Org: ${user.org_name}` : null}
                    {user.bookings_count != null ? ` Bookings: ${user.bookings_count}` : null}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge tone={user.is_active ? "certified" : "pending"}>
                      {user.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
