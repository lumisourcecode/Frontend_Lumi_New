"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Employee = {
  id: string;
  employee_user_id: string;
  email: string;
  title?: string;
  status: "invited" | "active" | "disabled";
};

export default function PartnerEmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"invited" | "active" | "disabled">("active");
  const [editingId, setEditingId] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadEmployees() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const res = await apiJson<{ items: Employee[] }>("/partner/employees", undefined, session.accessToken);
    setItems(res.items);
  }

  useEffect(() => {
    loadEmployees().catch(() => undefined);
  }, []);

  async function addEmployee() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!email) {
      setMsg("Employee email is required.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiJson("/partner/employees", {
        method: "POST",
        body: JSON.stringify({ email, title }),
      }, session.accessToken);
      setEmail("");
      setTitle("");
      await loadEmployees();
      setMsg("Employee invited.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to add employee");
    } finally {
      setBusy(false);
    }
  }

  async function updateEmployee(id: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/partner/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, status }),
      }, session.accessToken);
      await loadEmployees();
      setEditingId("");
      setMsg("Employee updated.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to update employee");
    } finally {
      setBusy(false);
    }
  }

  async function removeEmployee(id: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/partner/employees/${id}`, { method: "DELETE" }, session.accessToken);
      await loadEmployees();
      setMsg("Employee removed.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to remove employee");
    } finally {
      setBusy(false);
    }
  }

  async function inviteEmployee(id: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/partner/employees/${id}/invite`, { method: "POST", body: JSON.stringify({}) }, session.accessToken);
      setMsg("Invite sent.");
      await loadEmployees();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to send invite");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Partner Employees</h1>
        <p className="mt-2 text-sm text-indigo-100">Manage tenant staff and role access for your organization.</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Add Employee</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Employee email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button onClick={addEmployee} disabled={busy}>{busy ? "Saving..." : "Add Employee"}</Button>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Employee Directory</h2>
        <div className="mt-3 space-y-2">
          {items.map((emp) => (
            <div key={emp.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-medium">{emp.email}</p>
              <p className="text-sm text-slate-500">{emp.title || "No title"} • {emp.status}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {editingId === emp.id ? (
                  <>
                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                      <option value="invited">Invited</option>
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </Select>
                    <Button size="sm" onClick={() => updateEmployee(emp.id)} disabled={busy}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId("")}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(emp.id); setTitle(emp.title || ""); setStatus(emp.status); }}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => inviteEmployee(emp.id)} disabled={busy}>Invite</Button>
                    <Button size="sm" variant="danger" onClick={() => removeEmployee(emp.id)} disabled={busy}>Remove</Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 ? <p className="text-sm text-slate-500">No employees yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}

