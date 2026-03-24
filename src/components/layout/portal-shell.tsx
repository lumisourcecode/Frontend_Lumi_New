"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { cn } from "@/lib/utils";
import { getNavItems, LOGIN_PATHS, type RoleType } from "@/lib/navigation";
import { clearAuthSession, getAuthSession } from "@/lib/api-client";

type PortalShellProps = {
  role: RoleType;
  title: string;
  children: ReactNode;
};

export function PortalShell({ role, title, children }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getAuthSession();
  const loginPath = LOGIN_PATHS[role];
  const isLoginPage = pathname === loginPath;
  const isLoggedIn = !!(session?.accessToken && session?.user?.roles?.includes(role));
  const navItems = getNavItems(role, isLoggedIn);

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
    router.refresh();
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Logo href="/" variant="dark" className="h-8 w-auto" />
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
              ← Portal selection
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-slate-900">
      <div className="mx-auto flex max-w-[1700px] flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-white/15 bg-[var(--color-primary)] p-5 text-white shadow-xl md:sticky md:top-0 md:h-screen md:w-72 md:overflow-y-auto md:border-r md:border-b-0 md:border-slate-200/10 md:shadow-none">
          <Logo href="/" variant="light" className="h-9 w-auto" />
          <p className="mb-5 mt-1 text-xs font-medium uppercase tracking-wider text-slate-300">{title}</p>
          <nav className="grid gap-1 pb-6">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white/15 text-white shadow-inner"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex flex-col gap-2 border-b border-slate-200/80 bg-white/98 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{role}</p>
              <p className="font-semibold text-[var(--color-primary)]">{title}</p>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
              <NotificationBell role={role} />
              {session?.user?.email && (
                <span className="hidden max-w-[180px] truncate text-xs text-slate-500 sm:inline">{session.user.email}</span>
              )}
              <Button variant="outline" className="shrink-0 px-3 py-1.5 text-xs" onClick={handleLogout}>
                Logout
              </Button>
            </div>
            </div>
            {role === "driver" && isLoggedIn ? (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                <Link
                  href="/driver/dashboard"
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    pathname === "/driver/dashboard"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/driver/manifest"
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    pathname === "/driver/manifest"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  )}
                >
                  Manifest
                </Link>
              </div>
            ) : null}
          </header>
          <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
