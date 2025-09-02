"use client";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useProjectId } from "@/hooks/use-project-id";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectAvatar } from "@/components/project-avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import TaskViewSwitcher from "@/components/task-view-switcher";

function ProjectIdPage() {
  const { workspaceId } = useWorkspaceId();
  const { projectId } = useProjectId();
  if (!projectId || !workspaceId) return null;

  const { data: project } = useSuspenseQuery(
    convexQuery(api.projects.get, { projectId, workspaceId }),
  );
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.thumbnail}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <div>
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/workspaces/projects/settings?workspace=${workspaceId}&project=${projectId}`}
            >
              <Pencil className="mr-2 size-4" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      <TaskViewSwitcher></TaskViewSwitcher>
    </div>
  );
}

export default ProjectIdPage;
