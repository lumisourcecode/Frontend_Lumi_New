import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalShell } from "@/components/layout/portal-shell";

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="partner">
      <PortalShell role="partner" title="Partner Portal">
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
