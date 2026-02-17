import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell role="agent" title="Agent / Partner Portal">
      {children}
    </PortalShell>
  );
}
