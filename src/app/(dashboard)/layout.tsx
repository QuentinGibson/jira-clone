import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";

interface LayoutProps {
  children: ReactNode;
}
function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
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
