import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";

export default function RiderLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell role="rider" title="Rider Portal">
      {children}
    </PortalShell>
  );
}
