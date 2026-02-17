"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { navigation, type RoleType } from "@/lib/navigation";

type PortalShellProps = {
  role: RoleType;
  title: string;
  children: ReactNode;
};

export function PortalShell({ role, title, children }: PortalShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-slate-900">
      <div className="mx-auto flex max-w-[1700px] flex-col md:flex-row">
        <aside className="w-full border-b border-white/20 bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-primary-2)] to-[var(--color-primary-3)] p-4 text-white md:sticky md:top-0 md:h-screen md:w-80 md:overflow-y-auto md:border-r md:border-b-0">
          <h1 className="text-2xl font-bold tracking-tight">Lumi Ride</h1>
          <p className="mb-6 text-xs text-indigo-100">{title}</p>
          <nav className="grid gap-2">
            {navigation[role].map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-sm transition",
                    active
                      ? "border-white/30 bg-white/20 text-white"
                      : "border-transparent text-slate-100 hover:border-white/20 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
              <p className="font-semibold text-[var(--color-primary)]">{title}</p>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
              <Input className="max-w-xs" placeholder="Search users, drivers, invoices..." />
            </div>
          </header>
          <main className="space-y-4 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
