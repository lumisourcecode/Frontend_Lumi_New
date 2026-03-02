import Link from "next/link";
import { Accessibility, Car, Phone, Shield } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Card className="border-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[var(--color-primary-3)] text-white">
        <h1 className="text-3xl font-bold">Accessible Transport for Everyone</h1>
        <p className="mt-2 max-w-2xl text-slate-100">
          Lumi Ride is designed for NDIS participants, wheelchair users, and people with mobility needs.
          Book wheelchair-accessible rides, specify support requirements, and travel with confidence.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Accessibility className="size-10 text-[var(--color-primary)]" />
          <h2 className="mt-3 text-lg font-bold text-[var(--color-primary)]">Mobility Options</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>• Wheelchair-accessible vehicles</li>
            <li>• Service animal support</li>
            <li>• Door-to-door assistance</li>
            <li>• Companion / carer required</li>
          </ul>
        </Card>
        <Card>
          <Car className="size-10 text-[var(--color-primary)]" />
          <h2 className="mt-3 text-lg font-bold text-[var(--color-primary)]">NDIS Ready</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>• Plan-managed & self-managed</li>
            <li>• NDIS number in profile</li>
            <li>• Subsidy calculations (MPTP)</li>
          </ul>
        </Card>
        <Card>
          <Shield className="size-10 text-[var(--color-primary)]" />
          <h2 className="mt-3 text-lg font-bold text-[var(--color-primary)]">WCAG 2.1 AA</h2>
          <p className="mt-2 text-sm text-slate-700">
            High-contrast visuals, large controls, keyboard navigation, and screen-reader friendly.
          </p>
        </Card>
        <Card>
          <Phone className="size-10 text-[var(--color-primary)]" />
          <h2 className="mt-3 text-lg font-bold text-[var(--color-primary)]">24/7 Support</h2>
          <p className="mt-2 text-sm text-slate-700">
            Call <a href="tel:1300586474" className="font-semibold text-[var(--color-primary)]">1300 586 474</a> for booking help or accessibility questions.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-[var(--color-primary)]">Book an Accessible Ride</h2>
        <p className="mt-2 text-sm text-slate-700">
          Specify your mobility needs when booking. Drivers receive your requirements and can prepare accordingly.
        </p>
        <Link href="/book-my-ride" className="mt-4 inline-block">
          <Button>Book My Ride</Button>
        </Link>
      </Card>
    </div>
  );
}
