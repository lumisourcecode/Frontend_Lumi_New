import { Badge, Button, Card, Input, Progress, Select, Textarea } from "@/components/ui/primitives";

const applicants = [
  {
    id: "DRV-APP-207",
    name: "Mia Patel",
    city: "Melbourne",
    license: "Verified",
    policeCheck: "Pending",
    vehicle: "Uploaded",
    interview: "Scheduled",
    score: 72,
  },
  {
    id: "DRV-APP-208",
    name: "Liam Tran",
    city: "Geelong",
    license: "Verified",
    policeCheck: "Verified",
    vehicle: "Uploaded",
    interview: "Completed",
    score: 94,
  },
  {
    id: "DRV-APP-209",
    name: "Asha Nair",
    city: "Ballarat",
    license: "Pending",
    policeCheck: "Pending",
    vehicle: "Missing",
    interview: "Not Started",
    score: 36,
  },
];

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Driver Enrollment Requests</h1>
        <p className="mt-2 text-sm text-indigo-100">
          End-to-end hiring workflow for incoming driver applications with follow-up checkpoints and SLA tracking.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">New Applications</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">24</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Document Review</p>
          <p className="text-2xl font-bold text-amber-700">11</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Interview Stage</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">8</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Ready to Activate</p>
          <p className="text-2xl font-bold text-emerald-700">5</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Create Follow-up Task</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Applicant ID / Name" />
          <Select>
            <option>Step: License validation</option>
            <option>Step: Police check follow-up</option>
            <option>Step: Vehicle inspection</option>
            <option>Step: Interview scheduling</option>
          </Select>
          <Input type="date" />
          <Select>
            <option>Owner: Recruitment Ops</option>
            <option>Owner: Compliance Team</option>
            <option>Owner: Dispatch Lead</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Follow-up notes" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Task</Button>
          <Button variant="outline">Send Reminder SMS</Button>
          <Button variant="outline">Email Document Checklist</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Enrollment Pipeline</h2>
        <div className="mt-3 space-y-3">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{applicant.name}</p>
                  <p className="text-xs text-slate-500">
                    {applicant.id} | {applicant.city}
                  </p>
                </div>
                <Badge tone={applicant.score >= 80 ? "certified" : applicant.score >= 60 ? "pending" : "danger"}>
                  Readiness {applicant.score}%
                </Badge>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-4">
                <p>License: {applicant.license}</p>
                <p>Police: {applicant.policeCheck}</p>
                <p>Vehicle: {applicant.vehicle}</p>
                <p>Interview: {applicant.interview}</p>
              </div>
              <div className="mt-2">
                <Progress value={applicant.score} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline">Open Application</Button>
                <Button variant="outline">Request Missing Docs</Button>
                <Button variant="outline">Approve to Onboarding</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
