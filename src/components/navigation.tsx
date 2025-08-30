"use client";
import { SettingsIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import type { IconType } from "react-icons/lib";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface Route {
  label: string;
  href: string;
  icon: IconType;
  activeIcon: IconType;
}

const routes: Route[] = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
];

export const Navigation = () => {
  const pathname = usePathname();
  const { workspaceId } = useWorkspaceId();
  return (
    <SidebarMenu className="flex flex-col">
      {routes.map((route) => {
        //Check if the href is the current link
        const fullHref = `/workspaces${route.href}`;
        const paramsEndings = `?workspace=${workspaceId}`;
        const isActive = pathname === fullHref;
        console.log(`Pathname: ${pathname}`);
        console.log(`Href: ${fullHref}`);

        const Icon = isActive ? route.activeIcon : route.icon;
        return (
          <SidebarMenuItem key={route.href}>
            <SidebarMenuButton asChild>
              <a href={fullHref + paramsEndings}>
                <div
                  className={cn(
                    "hover:text-primary flex items-center gap-2.5 rounded-md p-2.5 font-medium text-neutral-500 transition",
                    isActive &&
                      "text-primary bg-white shadow-sm hover:opacity-100",
                  )}
                >
                  <Icon className="size-5 text-neutral-500" />
                  <span>{route.label}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};
