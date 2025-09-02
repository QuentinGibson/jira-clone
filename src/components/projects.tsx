"use client";
import { useCreateProjectModal } from "@/hooks/use-create-project-modal";
import { RiAddCircleFill } from "react-icons/ri";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ProjectAvatar } from "./project-avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Projects() {
  const { open } = useCreateProjectModal();
  const { workspaceId } = useWorkspaceId();
  const pathname = usePathname();
  const { data: projects } = useQuery({
    ...convexQuery(api.projects.list, {
      workspaceId,
    }),
    enabled: workspaceId !== null,
  });
  return (
    <div>
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-neutral-500 uppercase">Projects</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 cursor-pointer text-neutral-500"
        />
      </div>
      <div className="flex flex-col gap-y-4 px-2 py-4">
        {projects?.map((project) => {
          const href = `/workspaces/projects?workspace=${workspaceId}&project=${project._id}`;
          const isActive = pathname === href;
          return (
            <Link key={project._id} href={href}>
              <div
                className={cn(
                  "text-muted-foreground flex items-center gap-2.5 rounded-md text-xs transition hover:opacity-75",
                  isActive &&
                    "text-primary bg-white shadow-sm hover:opacity-100",
                )}
              >
                <ProjectAvatar name={project.name} image={project.thumbnail} />
                <span className="truncate">{project.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Projects;
