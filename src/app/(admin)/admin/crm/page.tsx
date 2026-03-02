"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Rider = { id: string; email: string; full_name?: string; phone?: string; ndis_id?: string; bookings_count?: string };
type Driver = { id: string; email: string; full_name?: string; phone?: string; vehicle_rego?: string; verification_status?: string };

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"rider" | "driver" | "agent">("rider");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [ndisId, setNdisId] = useState("");
  const [vehicleRego, setVehicleRego] = useState("");
  const [orgName, setOrgName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const session = getAuthSession();
    if (!session?.accessToken || !email || !password) return;
    setLoading(true);
    setMsg("");
    try {
      await apiJson("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          role,
          fullName: fullName || undefined,
          phone: phone || undefined,
          ndisId: role === "rider" ? ndisId || undefined : undefined,
          vehicleRego: role === "driver" ? vehicleRego || undefined : undefined,
          orgName: role === "agent" ? orgName || undefined : undefined,
        }),
      }, session.accessToken);
      setMsg("User created.");
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setNdisId("");
      setVehicleRego("");
      setOrgName("");
      onCreated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="rider">Rider</option>
          <option value="driver">Driver</option>
          <option value="agent">Agent</option>
        </Select>
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {role === "rider" && <Input placeholder="NDIS ID" value={ndisId} onChange={(e) => setNdisId(e.target.value)} />}
        {role === "driver" && <Input placeholder="Vehicle rego" value={vehicleRego} onChange={(e) => setVehicleRego(e.target.value)} />}
        {role === "agent" && <Input placeholder="Org name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />}
      </div>
      <div className="flex gap-2">
        <Button disabled={loading || !email || !password} onClick={submit}>
          {loading ? "Creating..." : "Create User"}
        </Button>
        {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
      </div>
    </div>
  );
}

export default function AdminCrmPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    Promise.all([
      apiJson<{ items: Rider[] }>("/admin/riders", undefined, session.accessToken).then((r) => setRiders(r.items)),
      apiJson<{ items: Driver[] }>("/admin/drivers", undefined, session.accessToken).then((r) => setDrivers(r.items)),
    ]).finally(() => setLoading(false));
  }, [session?.accessToken]);

  const refetch = () => {
    if (!session?.accessToken) return;
    apiJson<{ items: Rider[] }>("/admin/riders", undefined, session.accessToken).then((r) => setRiders(r.items));
    apiJson<{ items: Driver[] }>("/admin/drivers", undefined, session.accessToken).then((r) => setDrivers(r.items));
  };

  const contacts = [
    ...riders.map((r) => ({ id: r.id, name: r.full_name || r.email, type: "Rider" as const, email: r.email })),
    ...drivers.map((d) => ({ id: d.id, name: d.full_name || d.email, type: "Driver" as const, email: d.email })),
  ];
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">CRM & Relationship Management</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Unified relationship layer for riders, carers, plan managers, drivers, and partner organizations.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create User (Rider / Driver / Agent)</h2>
        <p className="mt-1 text-xs text-slate-600">Creates a new platform user. They can then login from their portal.</p>
        <CreateUserForm onCreated={refetch} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Contact Directory</h2>
        <p className="mt-1 text-xs text-slate-500">Riders and drivers from the platform</p>
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading...</p>
          ) : contacts.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No contacts yet. Riders and drivers will appear here.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={`${contact.type}-${contact.id}`} className="border-b">
                    <td className="py-2 pr-4">{contact.name}</td>
                    <td className="py-2 pr-4">{contact.type}</td>
                    <td className="py-2 pr-4">{contact.email}</td>
                    <td className="py-2 pr-4"><Badge tone="certified">Active</Badge></td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <a href={contact.type === "Rider" ? `/admin/users/${contact.id}` : `/admin/users/${contact.id}`}>
                          <Button variant="outline">Open Record</Button>
                        </a>
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
