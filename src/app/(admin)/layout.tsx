import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <PortalShell role="admin" title="Admin Workspace">{children}</PortalShell>;
}
