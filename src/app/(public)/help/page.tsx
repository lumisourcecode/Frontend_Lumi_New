import { Button, Card, Input, Textarea } from "@/components/ui/primitives";

const faqs = [
  {
    q: "How early should I book?",
    a: "We recommend 24 hours notice. Same-day requests are supported based on available fleet capacity.",
  },
  {
    q: "Can carers receive updates?",
    a: "Yes. Pickup, ETA, and completion notifications can be shared with carers and support contacts.",
  },
  {
    q: "Do you support recurring transport?",
    a: "Yes. You can schedule repeat bookings for regular medical, therapy, or community appointments.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Contact support, report service issues, and get booking/compliance guidance from the Lumi team.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Contact Support</h2>
          <div className="mt-3 grid gap-3">
            <Input placeholder="Full name" />
            <Input placeholder="Email" type="email" />
            <Input placeholder="Phone" />
            <Textarea placeholder="How can we help you?" />
            <div className="flex flex-wrap gap-2">
              <Button>Submit Request</Button>
              <a href="tel:1300586474">
                <Button variant="outline">Call 1300 586 474</Button>
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Frequently Asked Questions</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{faq.q}</p>
                <p className="mt-1 text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
