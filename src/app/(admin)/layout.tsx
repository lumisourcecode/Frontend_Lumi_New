import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalShell } from "@/components/layout/portal-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="admin">
      <PortalShell role="admin" title="Admin Workspace">{children}</PortalShell>
    </AuthGuard>
  );
}
