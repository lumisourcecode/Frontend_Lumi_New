import { Badge, Card } from "@/components/ui/primitives";

const values = [
  "Accessible by design",
  "Reliable pre-book certainty",
  "Compliance and safety first",
  "Respectful support for every rider",
];

const roadmap = [
  { title: "Request", detail: "Bookings from app, phone, or partner roster are captured in one queue." },
  { title: "Match", detail: "Dispatch allocates nearby verified drivers using proximity + fairness rules." },
  { title: "Track", detail: "Riders and carers receive live ETA, pickup, and drop-off notifications." },
  { title: "Settle", detail: "Trips flow to invoicing, payment confirmation, and report exports." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-3xl font-bold">About Lumi Ride</h1>
        <p className="mt-3 max-w-4xl text-sm text-indigo-100">
          Lumi Ride is building a modern care transport ecosystem for NDIS participants, seniors, carers,
          and partner organizations with a focus on accessibility, trust, and operational excellence.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">What we do</h2>
          <p className="mt-3 text-sm text-slate-700">
            We provide scheduled and assisted transport with consistent communication, verified drivers,
            and transparent billing across private pay, plan-managed, and partner-funded rides.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {values.map((value) => (
              <Badge key={value} tone="default">
                {value}
              </Badge>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Who we support</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Participants and families needing reliable mobility support.</li>
            <li>Aged care facilities and nursing homes.</li>
            <li>Hospitals, clinics, and allied health providers.</li>
            <li>Support coordinators, plan managers, and partner agencies.</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-[var(--color-primary)]">How the platform works</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {roadmap.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">Step {index + 1}</p>
              <p className="mt-1 font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
