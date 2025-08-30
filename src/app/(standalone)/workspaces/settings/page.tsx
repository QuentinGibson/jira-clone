"use client";

import EditWorkspaceForm from "@/components/workspaces/edit-workspace-form";
import WorkspaceInvite from "@/components/workspaces/workspace-invite";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import type { Id } from "convex/_generated/dataModel";
import { useEffect } from "react";
function WorkspaceIdSettingsPage() {
  const router = useRouter();
  const { workspaceId } = useWorkspaceId();
  useEffect(() => {
    if (!workspaceId) {
      router.push(`/`);
    }
  }, [workspaceId, router]);
  const { data: workspace } = useSuspenseQuery(
    convexQuery(api.workspaces.getWorkplaceById, {
      id: workspaceId as Id<"workspaces">,
    }),
  );
  return (
    <div className="w-full lg:max-w-xl space-y-4">
      <EditWorkspaceForm initialValues={workspace} />
      <WorkspaceInvite workspaceId={workspaceId as Id<"workspaces">} />
    </div>
  );
}

export default WorkspaceIdSettingsPage;
