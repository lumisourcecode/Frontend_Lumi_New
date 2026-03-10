"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Ticket = {
  id: string;
  issue_type: string;
  reference_id?: string;
  priority: string;
  message: string;
  status: string;
  created_at: string;
};

export default function PartnerHelpCenterPage() {
  const [issueType, setIssueType] = useState("Booking");
  const [referenceId, setReferenceId] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [msg, setMsg] = useState("");

  async function loadTickets() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const res = await apiJson<{ items: Ticket[] }>("/partner/support-tickets", undefined, session.accessToken);
    setTickets(res.items);
  }

  useEffect(() => {
    loadTickets().catch(() => undefined);
  }, []);

  async function submitTicket() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!message.trim()) {
      setMsg("Please describe the issue.");
      return;
    }
    setMsg("");
    try {
      await apiJson("/partner/support-tickets", {
        method: "POST",
        body: JSON.stringify({ issueType, referenceId: referenceId || undefined, priority, message }),
      }, session.accessToken);
      setMessage("");
      setReferenceId("");
      await loadTickets();
      setMsg("Ticket submitted.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to submit ticket");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#141F68] to-[#2A8DBC] text-white">
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Support for coordinators, facilities, and care teams managing high-volume transport.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Support Request</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            <option>Issue Type: Booking</option>
            <option>Issue Type: Billing</option>
            <option>Issue Type: Client Data</option>
            <option>Issue Type: Urgent Escalation</option>
          </Select>
          <Input placeholder="Reference ID (optional)" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>Priority: Normal</option>
            <option>Priority: High</option>
            <option>Priority: Critical</option>
          </Select>
          <Textarea className="md:col-span-3" placeholder="Describe your issue, including affected clients/trips." value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={submitTicket}>Submit Ticket</Button>
          <Button variant="outline">Start Live Chat</Button>
        </div>
        {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">My Support Tickets</h2>
        <div className="mt-3 space-y-2 text-sm">
          {tickets.length === 0 ? (
            <p className="text-slate-500">No tickets yet.</p>
          ) : (
            tickets.slice(0, 20).map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-slate-200 p-3">
                <p><strong>{ticket.issue_type}</strong> ({ticket.priority}) • {ticket.status}</p>
                <p className="text-slate-600">{ticket.message}</p>
                <p className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Operational Contacts</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">Partner Operations Desk: 1300 586 474</div>
          <div className="rounded-xl border border-slate-200 p-3">Account Manager: partnercare@lumiride.com.au</div>
          <div className="rounded-xl border border-slate-200 p-3">Urgent Escalation: dispatch.ops@lumiride.com.au</div>
        </div>
      </Card>
    </div>
  );
}
