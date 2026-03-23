"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Booking = { id: string; pickup: string; dropoff: string; scheduled_at: string; status: string; trip_state?: string };
type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  status: string;
  issue_date: string;
};

export default function PartnerBillingPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [autoPayout, setAutoPayout] = useState(true);
  const [notice, setNotice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Booking[] }>("/partner/bookings", undefined, session.accessToken)
      .then((r) => setItems(r.items))
      .catch(() => {});
    apiJson<{ auto_invoice?: boolean; auto_payout?: boolean }>("/partner/billing", undefined, session.accessToken)
      .then((settings) => {
        if (typeof settings.auto_invoice === "boolean") setAutoInvoice(settings.auto_invoice);
        if (typeof settings.auto_payout === "boolean") setAutoPayout(settings.auto_payout);
      })
      .catch(() => {});
    apiJson<{ items: Invoice[] }>("/partner/invoices", undefined, session.accessToken)
      .then((r) => setInvoices(r.items))
      .catch(() => {});
  }, []);

  async function saveAutomation(next: { autoInvoice?: boolean; autoPayout?: boolean }) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setNotice("");
    try {
      await apiJson(
        "/partner/billing",
        {
          method: "PATCH",
          body: JSON.stringify({
            ...(typeof next.autoInvoice === "boolean" ? { autoInvoice: next.autoInvoice } : {}),
            ...(typeof next.autoPayout === "boolean" ? { autoPayout: next.autoPayout } : {}),
          }),
        },
        session.accessToken,
      );
      setNotice("Automation settings saved.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed to save settings");
    }
  }

  async function generateInvoiceNow() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const completed = filtered.find((b) => b.status === "completed");
    if (!completed) {
      setNotice("Complete at least one trip to generate an invoice.");
      return;
    }
    setNotice("");
    try {
      await apiJson(
        "/partner/invoices",
        {
          method: "POST",
          body: JSON.stringify({ bookingId: completed.id }),
        },
        session.accessToken,
      );
      const r = await apiJson<{ items: Invoice[] }>("/partner/invoices", undefined, session.accessToken);
      setInvoices(r.items);
      setNotice("Invoice generated successfully.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Invoice generation failed");
    }
  }

  async function sendReminder() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const pendingInvoice = invoices.find((i) => i.status !== "paid");
    if (!pendingInvoice) {
      setNotice("No pending invoice available to remind.");
      return;
    }
    setNotice("");
    try {
      await apiJson(
        `/partner/invoices/${pendingInvoice.id}/remind`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
        session.accessToken,
      );
      setNotice("Payment reminder sent.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed to send reminder");
    }
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const dt = new Date(item.scheduled_at);
      if (from && dt < new Date(from)) return false;
      if (to && dt > new Date(`${to}T23:59:59`)) return false;
      if (status !== "all" && item.status !== status) return false;
      return true;
    });
  }, [items, from, to, status]);

  const totals = useMemo(() => {
    const monthlySpend = filtered.length * 22;
    const pending = filtered.filter((b) => b.status !== "completed").length * 22;
    const completed = filtered.filter((b) => b.status === "completed").length * 22;
    return { monthlySpend, pending, completed };
  }, [filtered]);

  const payout = useMemo(() => {
    const gross = totals.completed;
    const commission = Math.round(gross * 0.08);
    const net = Math.max(gross - commission, 0);
    return { gross, commission, net };
  }, [totals.completed]);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#132060] to-[#257DB9] text-white">
        <h1 className="text-2xl font-bold">Partner Billing & Spend</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Track invoices, commissions, budgets, and claim-ready records for all facilities.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Estimated Spend</p><p className="text-2xl font-bold text-[#132060]">${totals.monthlySpend.toLocaleString()}</p></Card>
        <Card><p className="text-xs text-slate-500">Pending Invoices</p><p className="text-2xl font-bold text-amber-700">${totals.pending.toLocaleString()}</p></Card>
        <Card><p className="text-xs text-slate-500">Commission Earned</p><p className="text-2xl font-bold text-emerald-700">${Math.round(totals.completed * 0.08).toLocaleString()}</p></Card>
        <Card><p className="text-xs text-slate-500">Paid This Month</p><p className="text-2xl font-bold text-[#132060]">${totals.completed.toLocaleString()}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Automation & Money Flow</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase">Invoice Automation</p>
            <p className="mt-1 text-sm font-semibold">{autoInvoice ? "Enabled" : "Disabled"}</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant={autoInvoice ? "primary" : "outline"}
                onClick={() => {
                  setAutoInvoice(true);
                  saveAutomation({ autoInvoice: true });
                }}
              >
                Enable
              </Button>
              <Button
                size="sm"
                variant={!autoInvoice ? "danger" : "outline"}
                onClick={() => {
                  setAutoInvoice(false);
                  saveAutomation({ autoInvoice: false });
                }}
              >
                Disable
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase">Auto Payout</p>
            <p className="mt-1 text-sm font-semibold">{autoPayout ? "Weekly Auto-Payout On" : "Manual Payout Mode"}</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant={autoPayout ? "primary" : "outline"}
                onClick={() => {
                  setAutoPayout(true);
                  saveAutomation({ autoPayout: true });
                }}
              >
                Auto
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAutoPayout(false);
                  saveAutomation({ autoPayout: false });
                }}
              >
                Manual
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Net payout estimate this cycle: <span className="font-semibold text-slate-700">${payout.net.toLocaleString()}</span></p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Invoice Explorer</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select>
            <option>All Facilities</option>
            <option>Lakeside Nursing Home</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending_matching">Pending</option>
            <option value="completed">Paid</option>
          </Select>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {filtered.slice(0, 25).map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-3">
              INV-{booking.id.slice(0, 6)} | {booking.pickup} {"->"} {booking.dropoff} | $22{" "}
              <Badge tone={booking.status === "completed" ? "certified" : "pending"}>
                {booking.status === "completed" ? "Paid" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={generateInvoiceNow}>Auto Generate Invoice (Lumi Ride)</Button>
          <Button variant="outline" onClick={sendReminder}>Send Reminder</Button>
          <Button variant="outline">Export Billing Pack</Button>
        </div>
        {notice ? <p className="mt-2 text-xs text-slate-600">{notice}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Generated Invoices</h2>
        <div className="mt-3 space-y-2 text-sm">
          {invoices.length === 0 ? (
            <p className="text-slate-500">No invoices found yet.</p>
          ) : (
            invoices.slice(0, 25).map((inv) => (
              <div key={inv.id} className="rounded-xl border border-slate-200 p-3">
                {inv.invoice_number} | {inv.client_name || "Partner Client"} | ${inv.total_amount}
                <span className="mx-2 text-slate-400">|</span>
                <Badge tone={inv.status === "paid" ? "certified" : "pending"}>
                  {inv.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
