"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Input, Progress, Select, Textarea } from "@/components/ui/primitives";

const requiredDocuments = [
  "Driver License",
  "Visa / Work Rights",
  "NDIS Worker Screening",
  "Police Check",
  "Manual Handling Certificate",
  "CPR / First Aid Certificate",
];

export default function DriveWithUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const readiness = useMemo(() => {
    const uploadedCount = requiredDocuments.filter((doc) => checked[doc]).length;
    return Math.round((uploadedCount / requiredDocuments.length) * 100);
  }, [checked]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-3xl font-bold">Drive With Us</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Join Lumi as a casual or professional support driver. Flexible work, community impact,
          and a clear onboarding path from application to certification.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">Driver Enrollment Application</h2>
          <p className="mt-2 text-sm text-slate-700">
            Submit your profile and documents. Admin team reviews each step and sends updates by email/SMS.
          </p>
          <form
            className="mt-5 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Full name" required />
              <Input placeholder="Email" type="email" required />
              <Input placeholder="Phone number" required />
              <Select defaultValue="casual">
                <option value="casual">Role: Casual Driver</option>
                <option value="professional">Role: Support Worker Driver</option>
                <option value="fleet">Role: Fleet Supervisor Driver</option>
              </Select>
              <Input placeholder="Suburb / service region" />
              <Input placeholder="Vehicle type and plate" />
            </div>

            <h3 className="mt-2 text-sm font-semibold text-[var(--color-primary)]">Document Checklist</h3>
            {requiredDocuments.map((doc) => (
              <div key={doc} className="rounded-2xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{doc}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Input type="file" required />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={Boolean(checked[doc])}
                      onChange={(event) => {
                        setChecked((previous) => ({ ...previous, [doc]: event.target.checked }));
                      }}
                    />
                    Mark as uploaded
                  </label>
                </div>
              </div>
            ))}

            <Textarea placeholder="Experience, support background, available days, and notes" />
            <Button type="submit">Submit Driver Application</Button>
          </form>
          {submitted ? (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Application submitted. Confirmation sent and request added to Admin enrollment workflow.
            </p>
          ) : null}
        </Card>

        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Enrollment Progress</h3>
          <p className="mt-2 text-xs text-slate-600">Document readiness based on uploaded checklist.</p>
          <div className="mt-2">
            <Progress value={readiness} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-800">{readiness}% ready</p>

          <h3 className="mt-5 font-bold text-[var(--color-primary)]">Why drive with Lumi</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Flexible shifts with fair dispatch allocation.</li>
            <li>Purpose-driven work supporting participants.</li>
            <li>Structured onboarding and compliance support.</li>
            <li>Transparent payment and trip records.</li>
          </ul>

          <div className="mt-4 space-y-2 text-xs">
            <Badge tone="certified">Background checks required</Badge>
            <Badge tone="pending">Training and interview review</Badge>
            <Badge tone="default">Final certification before activation</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
