"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Plan = {
  id: string;
  name: string;
  target_group?: string;
  frequency: string;
  start_date?: string;
  end_date?: string;
  priority: string;
  notes?: string;
  status: string;
};

export default function PartnerPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    targetGroup: "",
    frequency: "Weekly",
    startDate: "",
    endDate: "",
    priority: "High",
    notes: "",
  });

  async function loadPlans() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const res = await apiJson<{ items: Plan[] }>("/partner/plans", undefined, session.accessToken);
    setPlans(res.items);
  }

  useEffect(() => {
    loadPlans().catch(() => undefined);
  }, []);

  async function createPlan() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!form.name.trim()) {
      setMsg("Plan name is required");
      return;
    }
    setMsg("");
    try {
      await apiJson("/partner/plans", {
        method: "POST",
        body: JSON.stringify(form),
      }, session.accessToken);
      setForm({ name: "", targetGroup: "", frequency: "Weekly", startDate: "", endDate: "", priority: "High", notes: "" });
      await loadPlans();
      setMsg("Plan created.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to create plan");
    }
  }

  async function updatePlanStatus(id: string, status: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    await apiJson(`/partner/plans/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, session.accessToken);
    await loadPlans();
  }

  async function deletePlan(id: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    await apiJson(`/partner/plans/${id}`, { method: "DELETE" }, session.accessToken);
    await loadPlans();
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#141F68] to-[#2B90BE] text-white">
        <h1 className="text-2xl font-bold">Travel Plans & Recurring Schedules</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Build weekly/monthly transport plans for clients based on treatment, therapy, and community routines.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Care Travel Plan</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input placeholder="Plan Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="Client Group / Ward" value={form.targetGroup} onChange={(e) => setForm((p) => ({ ...p, targetGroup: e.target.value }))} />
          <Select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}>
            <option>Frequency: Weekly</option>
            <option>Frequency: Fortnightly</option>
            <option>Frequency: Monthly</option>
          </Select>
          <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          <Select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
            <option>Priority: High</option>
            <option>Priority: Medium</option>
            <option>Priority: Low</option>
          </Select>
          <Textarea
            className="md:col-span-3"
            placeholder="Plan logic (e.g. Tue/Thu dialysis, Fri community outings)"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={createPlan}>Create Plan</Button>
          <Button variant="outline">Preview Capacity Impact</Button>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Active Plans</h2>
        <div className="mt-3 space-y-2 text-sm">
          {plans.length === 0 ? (
            <p className="text-slate-500">No plans yet.</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-slate-200 p-3">
                {plan.name} - {plan.frequency}{" "}
                <Badge tone={plan.status === "Active" ? "certified" : "pending"}>{plan.status}</Badge>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updatePlanStatus(plan.id, plan.status === "Active" ? "Draft" : "Active")}>
                    {plan.status === "Active" ? "Mark Draft" : "Activate"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deletePlan(plan.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
