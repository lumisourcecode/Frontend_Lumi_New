import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

const agentPortfolio = [
  {
    agent: "Sarah J.",
    region: "North",
    clients: 42,
    openTasks: 6,
    csat: "4.8",
    risk: "Low",
  },
  {
    agent: "Victor M.",
    region: "West",
    clients: 37,
    openTasks: 11,
    csat: "4.4",
    risk: "Medium",
  },
  {
    agent: "Alina R.",
    region: "East",
    clients: 29,
    openTasks: 15,
    csat: "4.1",
    risk: "High",
  },
];

const clientAssignments = [
  { client: "Ava Smith", plan: "NDIS Plan Managed", agent: "Sarah J.", status: "Stable" },
  { client: "Leo Khan", plan: "Private Pay", agent: "Victor M.", status: "Follow-up" },
  { client: "Amelia Ross", plan: "Partner Program", agent: "Alina R.", status: "Escalated" },
];

export default function AdminAgentsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Agent Review & Portfolios</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Monitor agent performance, client assignments, SLA compliance, and quality follow-up outcomes.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Active Agents</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">18</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Clients Managed</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">412</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">SLA Breaches (7d)</p>
          <p className="text-2xl font-bold text-amber-700">9</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Critical Escalations</p>
          <p className="text-2xl font-bold text-red-700">2</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Agent Coaching Review</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Select>
            <option>Select agent</option>
            <option>Sarah J.</option>
            <option>Victor M.</option>
            <option>Alina R.</option>
          </Select>
          <Input type="date" />
          <Select>
            <option>Outcome: Meets expectations</option>
            <option>Outcome: Improvement plan</option>
            <option>Outcome: Escalate to lead</option>
          </Select>
          <Select>
            <option>Next review in 30 days</option>
            <option>Next review in 14 days</option>
            <option>Next review in 7 days</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Review notes and action plan" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Save Review</Button>
          <Button variant="outline">Assign Improvement Tasks</Button>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Agent Portfolio Summary</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Agent</th>
                  <th className="py-2 pr-3">Region</th>
                  <th className="py-2 pr-3">Clients</th>
                  <th className="py-2 pr-3">Open Tasks</th>
                  <th className="py-2 pr-3">CSAT</th>
                  <th className="py-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {agentPortfolio.map((row) => (
                  <tr key={row.agent} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">{row.agent}</td>
                    <td className="py-2 pr-3">{row.region}</td>
                    <td className="py-2 pr-3">{row.clients}</td>
                    <td className="py-2 pr-3">{row.openTasks}</td>
                    <td className="py-2 pr-3">{row.csat}</td>
                    <td className="py-2">
                      <Badge tone={row.risk === "Low" ? "certified" : row.risk === "Medium" ? "pending" : "danger"}>
                        {row.risk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Clients Under Agents</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Assigned Agent</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientAssignments.map((row) => (
                  <tr key={row.client} className="border-b">
                    <td className="py-2 pr-3 font-medium text-slate-900">{row.client}</td>
                    <td className="py-2 pr-3">{row.plan}</td>
                    <td className="py-2 pr-3">{row.agent}</td>
                    <td className="py-2 pr-3">
                      <Badge
                        tone={
                          row.status === "Stable"
                            ? "certified"
                            : row.status === "Follow-up"
                              ? "pending"
                              : "danger"
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button variant="outline">Open Client Profile</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
