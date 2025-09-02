import type { ReactNode } from "react";

interface DashboardContainerProps {
  children: ReactNode;
}
function DashboardContainer({ children }: DashboardContainerProps) {
  return <div className="text-muted-foreground px-6 py-4">{children}</div>;
}

export default DashboardContainer;
