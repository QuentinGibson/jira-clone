import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/navigation";
import WorkplaceSwitcher from "@/components/workplace-switcher";
import Projects from "@/components/projects";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex pl-3">
          <Image src="/logo.svg" width={164} height={48} alt="Logo" />
        </Link>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <WorkplaceSwitcher />
        </SidebarGroup>
        <SidebarGroup />
        <Navigation />
        <SidebarGroup />
        <Separator />
        <SidebarGroup>
          <Projects />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
