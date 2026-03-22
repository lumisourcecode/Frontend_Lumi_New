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
      <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-sky-500/30">
        <header className="border-b border-white/5 bg-slate-950/50 px-6 py-4 backdrop-blur-xl sticky top-0 z-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Logo href="/" variant="light" className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-2">
              <span className="text-lg">←</span> Portal Selection
            </Link>
          </div>
        </header>
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-sky-500/30 overflow-x-hidden font-sans">
      <div className="mx-auto flex w-full flex-col lg:flex-row min-h-screen">
        {/* Modern Sidebar */}
        <aside className="w-full shrink-0 z-40 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between lg:justify-center mb-10">
            <Logo href="/" variant="light" className="h-10 w-auto hover:scale-105 transition-transform" />
            <div className="lg:hidden flex items-center gap-4">
              <NotificationBell role={role} />
              <button className="p-2 text-slate-400" onClick={handleLogout}>Logout</button>
            </div>
          </div>
          
          <div className="hidden lg:block w-full mb-8">
            <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400 mb-0.5">{role} Access</p>
              <h1 className="text-sm font-semibold text-slate-100 truncate">{title}</h1>
            </div>
          </div>

          <nav className="w-full space-y-1.5 flex-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    active
                      ? "text-white bg-sky-500/10 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-full" />}
                  <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:translate-x-1")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block w-full mt-auto pt-6 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            >
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col relative">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-slate-950/30 backdrop-blur-xl px-6 py-4">
            <div className="lg:hidden">
               <h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest">{role}</h2>
            </div>
            <div className="hidden lg:block">
              <div className="h-8 w-24 bg-gradient-to-r from-sky-400/20 to-transparent rounded-full blur-2xl absolute -left-10 opacity-50" />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-4">
                <NotificationBell role={role} />
                {session?.user?.email && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Account</span>
                    <span className="max-w-[150px] truncate text-xs font-medium text-slate-300">{session.user.email}</span>
                  </div>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 border border-white/20 shadow-lg shadow-sky-500/20" />
            </div>
          </header>

          <main className="flex-1 w-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
              {children}
            </div>
          </main>
          
          {/* Subtle Background Elements */}
          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="fixed top-0 left-72 w-[500px] h-[500px] bg-sky-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
