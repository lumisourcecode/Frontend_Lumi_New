import type { ReactNode } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Logo } from "@/components/ui/logo";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <PublicHeader />
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          <div>
            <Logo href="/" variant="dark" className="h-10 w-auto" />
            <p className="mt-2 text-xs text-slate-600">
              Accessible, reliable, and compliance-first transport for participants, families, and care organizations.
            </p>
          </div>
          <div className="text-xs text-slate-600">
            <p className="mb-2 font-semibold text-slate-800">Platform</p>
            <div className="grid gap-1">
              <Link href="/book-my-ride">Book My Ride</Link>
              <Link href="/drive-with-us">Drive With Us</Link>
              <Link href="/partners">Partner With Lumi</Link>
              <Link href="/help">Help Center</Link>
            </div>
          </div>
          <div className="text-xs text-slate-600">
            <p className="mb-2 font-semibold text-slate-800">Company</p>
            <div className="grid gap-1">
              <Link href="/about">About</Link>
              <Link href="/accessibility">Accessibility</Link>
              <Link href="/login">Login</Link>
            </div>
          </div>
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Contact</p>
            <p className="mt-2">1300 586 474</p>
            <p>support@lumiride.com.au</p>
            <p className="mt-2">Service hours: 6am - 11pm, 7 days</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
