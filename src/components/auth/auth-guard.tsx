"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api-client";
import { LOGIN_PATHS, type RoleType } from "@/lib/navigation";

const DASHBOARD_PATHS: Record<RoleType, string> = {
  rider: "/rider/dashboard",
  driver: "/driver/onboard",
  agent: "/agent/dashboard",
  admin: "/admin/dashboard",
};

type AuthGuardProps = {
  role: RoleType;
  children: ReactNode;
};

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "1";

export function AuthGuard({ role, children }: AuthGuardProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const loginPath = LOGIN_PATHS[role];
  const isLoginPage = pathname === loginPath || pathname?.endsWith("/login");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (SKIP_AUTH || !mounted) return;

    if (isLoginPage) {
      const session = getAuthSession();
      const hasRole = session?.user?.roles?.includes(role) ?? false;
      if (hasRole && session?.accessToken) {
        router.replace(DASHBOARD_PATHS[role]);
      }
      return;
    }

    const session = getAuthSession();
    const hasSession = !!session?.accessToken;
    const hasRole = session?.user?.roles?.includes(role) ?? false;

    if (!hasSession || !hasRole) {
      router.replace(loginPath);
    }
  }, [mounted, isLoginPage, role, loginPath, router]);

  if (SKIP_AUTH) return <>{children}</>;

  if (!mounted) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (isLoginPage) {
    const session = getAuthSession();
    const hasRole = session?.user?.roles?.includes(role) ?? false;
    if (hasRole && session?.accessToken) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-500">Redirecting to dashboard…</p>
        </div>
      );
    }
    return <>{children}</>;
  }

  const session = getAuthSession();
  const hasSession = !!session?.accessToken;
  const hasRole = session?.user?.roles?.includes(role) ?? false;

  if (!hasSession || !hasRole) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Redirecting to login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
