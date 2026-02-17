import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell role="driver" title="Driver Mobile App">
      {children}
    </PortalShell>
  );
}
