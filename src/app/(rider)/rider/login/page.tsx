"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";

export default function RiderLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <PortalLoginForm portal="rider" allowRegister />
        <p className="mt-6 text-center text-xs text-slate-500">
          Same email works for Driver or Partner if you register there.
        </p>
      </div>
    </div>
  );
}
