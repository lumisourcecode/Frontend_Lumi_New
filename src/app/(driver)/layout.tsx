import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalShell } from "@/components/layout/portal-shell";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="driver">
      <PortalShell role="driver" title="Driver Mobile App">
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
