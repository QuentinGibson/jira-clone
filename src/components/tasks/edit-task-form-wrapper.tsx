"use client";
import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "../ui/card";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import CreateTaskForm from "./create-tasks-form";
import type { Id } from "convex/_generated/dataModel";
import EditTaskForm from "./edit-tasks-form";

interface EditFormWrapperProps {
  onCancel: () => void;
  id: Id<"tasks">;
}

function EditFormWrapper({ onCancel, id }: EditFormWrapperProps) {
  const { workspaceId } = useWorkspaceId();
  const { projectId } = useProjectId();

  const { data: task } = useSuspenseQuery(
    convexQuery(api.tasks.getById, { taskId: id, projectId, workspaceId }),
  );

  const { data: projects } = useSuspenseQuery(
    convexQuery(api.projects.list, { workspaceId }),
  );
  const { data: members } = useSuspenseQuery(
    convexQuery(api.members.listWorkspaceMembers, { workspaceId }),
  );
  const projectOptions = projects.map((project) => ({
    _id: project._id,
    name: project.name,
    imageUrl: project.thumbnail,
  }));

  const memberOptions = members.map((member) => ({
    _id: member._id,
    name: member.name,
  }));

  const IsLoading = () => (
    <Card className="h-[714px] w-full border-none shadow-none">
      <CardContent className="flex h-full items-center justify-center">
        <Loader className="text-muted-foreground size-5 animate-spin" />
      </CardContent>
    </Card>
  );

  return (
    <Suspense fallback={<IsLoading />}>
      <EditTaskForm
        initialValues={task}
        projectOptions={projectOptions}
        memberOptions={memberOptions}
        onCancel={onCancel}
      />
    </Suspense>
  );
}

export default EditFormWrapper;
