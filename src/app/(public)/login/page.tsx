"use client";

import Link from "next/link";
import { Car, ShieldCheck, User, Users } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="rounded-2xl border-0 bg-[var(--color-primary)] px-6 py-8 text-white shadow-xl">
        <Logo href="/" variant="light" className="mb-3 h-12 w-auto" />
        <p className="max-w-2xl text-sm leading-relaxed text-slate-200">
          Separate portals for riders, drivers, partners, and admin. One email can have multiple roles if you register separately in each portal.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col transition-shadow hover:shadow-lg">
          <div className="rounded-xl bg-slate-100 p-3 w-fit">
            <User className="size-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[var(--color-primary)]">Rider</h2>
          <p className="mt-1 flex-1 text-sm text-slate-600">
            Book rides, view history, manage NDIS and profile.
          </p>
          <Link href="/rider/login" className="mt-5">
            <Button className="w-full">Rider Login</Button>
          </Link>
        </Card>
        <Card className="flex flex-col transition-shadow hover:shadow-lg">
          <div className="rounded-xl bg-slate-100 p-3 w-fit">
            <Car className="size-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[var(--color-primary)]">Driver</h2>
          <p className="mt-1 flex-1 text-sm text-slate-600">
            Manifest, earnings, shift, documents.
          </p>
          <Link href="/driver/login" className="mt-5">
            <Button className="w-full">Driver Login</Button>
          </Link>
        </Card>
        <Card className="flex flex-col transition-shadow hover:shadow-lg">
          <div className="rounded-xl bg-slate-100 p-3 w-fit">
            <Users className="size-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[var(--color-primary)]">Partner</h2>
          <p className="mt-1 flex-1 text-sm text-slate-600">
            Client bookings, roster, billing.
          </p>
          <Link href="/partner/login" className="mt-5">
            <Button className="w-full">Partner Login</Button>
          </Link>
        </Card>
        <Card className="flex flex-col transition-shadow hover:shadow-lg">
          <div className="rounded-xl bg-slate-100 p-3 w-fit">
            <ShieldCheck className="size-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[var(--color-primary)]">Admin</h2>
          <p className="mt-1 flex-1 text-sm text-slate-600">
            Super admin creates users. admin@lumiride.com.au
          </p>
          <Link href="/admin/login" className="mt-5">
            <Button variant="outline" className="w-full">Admin Login</Button>
          </Link>
        </Card>
      </div>

      <Card className="border-slate-200/80">
        <h3 className="font-bold text-[var(--color-primary)]">How it works</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex gap-2"><span className="text-[var(--color-accent)]">•</span> <strong>One email, multiple roles:</strong> Register separately in each portal (Rider, Driver, Partner) to add that role to your account.</li>
          <li className="flex gap-2"><span className="text-[var(--color-accent)]">•</span> <strong>Portal-scoped login:</strong> Sign in from the portal you need. If not registered for that role, you must register first.</li>
          <li className="flex gap-2"><span className="text-[var(--color-accent)]">•</span> <strong>Super admin:</strong> Only admin@lumiride.com.au (seeded). They create all other users including admins.</li>
        </ul>
      </Card>
    </div>
  );
}
