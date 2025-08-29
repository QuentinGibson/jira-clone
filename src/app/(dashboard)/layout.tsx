import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";
import CreateWorkspaceModal from "@/components/create-workspace-modal";

interface LayoutProps {
  children: ReactNode;
}
function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <div className="flex h-full w-full">
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <SidebarTrigger />
            <div className="w-full">
              <Navbar />
            </div>
            {children}
          </main>
        </SidebarProvider>
      </div>
    </div>
  );
}

export default Layout;
