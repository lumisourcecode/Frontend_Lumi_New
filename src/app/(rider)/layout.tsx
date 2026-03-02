import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalShell } from "@/components/layout/portal-shell";

export default function RiderLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="rider">
      <PortalShell role="rider" title="Rider Portal">
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
