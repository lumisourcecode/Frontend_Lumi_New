"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";

export default function AgentLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <PortalLoginForm portal="agent" allowRegister />
        <p className="mt-6 text-center text-xs text-slate-500">
          Same email works for Rider or Driver if you register there.
        </p>
      </div>
    </div>
  );
}
