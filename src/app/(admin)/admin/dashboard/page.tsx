import Link from "next/link";
import { Badge, Button, Card, Progress } from "@/components/ui/primitives";

const urgentQueue = [
  {
    id: "INC-2402",
    title: "Driver verification expired",
    detail: "3 drivers cannot accept trips until police check is renewed.",
    tone: "danger" as const,
    action: "/admin/enrollments",
    actionLabel: "Open enrollments",
  },
  {
    id: "INV-9011",
    title: "Manual payment waiting confirmation",
    detail: "2 transfers are pending receipt upload and finance approval.",
    tone: "pending" as const,
    action: "/admin/payments",
    actionLabel: "Review payments",
  },
  {
    id: "AGT-44",
    title: "Agent SLA risk",
    detail: "North region follow-ups breached 24h target for 4 clients.",
    tone: "pending" as const,
    action: "/admin/agents",
    actionLabel: "View agent review",
  },
];

const kpis = [
  { label: "Active Riders", value: "214", note: "+18 this month" },
  { label: "Drivers Online", value: "49", note: "7 pending onboarding" },
  { label: "Trips Today", value: "326", note: "96% on-time" },
  { label: "Invoices Auto-Sent", value: "1,132", note: "91% automation rate" },
  { label: "Outstanding Receivables", value: "$24,190", note: "14+ day aging: $4,980" },
  { label: "Open Compliance Flags", value: "7", note: "2 high priority" },
];

const quickActions = [
  { title: "Create user", href: "/admin/users" },
  { title: "Approve driver", href: "/admin/enrollments" },
  { title: "Launch invoice run", href: "/admin/billing" },
  { title: "Confirm manual payment", href: "/admin/payments" },
  { title: "Review agent portfolio", href: "/admin/agents" },
  { title: "Export executive report", href: "/admin/reports" },
];

const automationHealth = [
  { label: "Auto invoicing", value: 91 },
  { label: "Reminder delivery", value: 95 },
  { label: "Driver onboarding pipeline", value: 78 },
  { label: "Compliance sync", value: 88 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[var(--color-primary)] via-indigo-800 to-indigo-950 text-white">
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <div>
            <h1 className="text-2xl font-bold">Enterprise Admin Workspace</h1>
            <p className="mt-2 max-w-3xl text-sm text-indigo-100">
              Unified control center for dispatch, billing, user access, driver enrollment, agent
              operations, compliance, and reporting.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button>Run End-of-Day Automation</Button>
              <Button variant="soft">Download Operations Snapshot</Button>
            </div>
          </div>
          <Card className="border border-white/20 bg-white/10 p-4 text-white shadow-none">
            <p className="text-xs uppercase tracking-wide text-indigo-100">Live Operational Status</p>
            <p className="mt-2 text-2xl font-bold">Stable</p>
            <p className="mt-1 text-xs text-indigo-100">All critical systems healthy. 3 medium-priority actions pending.</p>
          </Card>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{kpi.value}</p>
            <p className="text-xs text-slate-600">{kpi.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Priority Queue</h2>
          <div className="mt-3 space-y-3">
            {urgentQueue.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <Badge tone={item.tone}>{item.id}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                <Link href={item.action} className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)]">
                  {item.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Quick Actions</h2>
          <div className="mt-3 grid gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {action.title}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Automation Health</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {automationHealth.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">{item.value}%</p>
              </div>
              <div className="mt-2">
                <Progress value={item.value} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
