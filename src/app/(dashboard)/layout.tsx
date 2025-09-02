import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";
import CreateWorkspaceModal from "@/components/create-workspace-modal";
import CreateProjectModal from "@/components/projects/create-project-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";

interface LayoutProps {
  children: ReactNode;
}
function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
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
