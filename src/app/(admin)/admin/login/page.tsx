"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <PortalLoginForm portal="admin" allowRegister={false} />
    </div>
  );
}
