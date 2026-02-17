"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[var(--color-primary-3)] px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Lumi Ride
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {navigation.public.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 transition",
                  active ? "bg-white/20 text-white" : "text-slate-100 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a href="tel:1300586474">
            <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white hover:text-[var(--color-primary)]">
              <PhoneCall className="mr-2 size-4" />
              1300 586 474
            </Button>
          </a>
        </nav>
      </div>
    </header>
  );
}
