import DashboardContainer from "@/components/DashboardContainer";
import type { ReactNode } from "react";

interface WorkspaceIDLayoutProps {
  children: ReactNode;
}

function Layout({ children }: WorkspaceIDLayoutProps) {
  return <DashboardContainer>{children}</DashboardContainer>;
}

export default Layout;
