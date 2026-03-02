import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalShell } from "@/components/layout/portal-shell";

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="agent">
      <PortalShell role="agent" title="Agent / Partner Portal">
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
