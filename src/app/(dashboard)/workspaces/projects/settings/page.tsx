"use client";
import EditProjectForm from "@/components/projects/edit-project-form";
import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

function ProjectSettingsPage() {
  const { projectId } = useProjectId();
  const { workspaceId } = useWorkspaceId();
  const { data: project } = useSuspenseQuery(
    convexQuery(api.projects.get, { projectId, workspaceId }),
  );
  return (
    <div>
      <EditProjectForm initialValues={project} />
    </div>
  );
}

export default ProjectSettingsPage;
