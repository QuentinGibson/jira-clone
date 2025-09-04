import { cn } from "@/lib/utils";
import type { Doc, Id } from "convex/_generated/dataModel";
import { TaskStatus } from "types";
import { MemberAvatar } from "./member-avatar";
import { ProjectAvatar } from "./project-avatar";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import type { MouseEvent } from "react";
import { createSerializer, parseAsString } from "nuqs";
import { useProjectId } from "@/hooks/use-project-id";
import type { Route } from "next";

interface EventCardProps {
  id: Id<"tasks">;
  title: string;
  assignee: Doc<"users">;
  project: Doc<"projects">;
  status: TaskStatus;
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: "border-l-pink-500",
  [TaskStatus.In_Review]: "border-l-blue-500",
  [TaskStatus.In_Progress]: "border-l-yellow-500",
  [TaskStatus.Todo]: "border-l-red-500",
  [TaskStatus.Done]: "border-l-emerald-500",
};

function EventCard({ id, title, assignee, project, status }: EventCardProps) {
  const router = useRouter();
  const { workspaceId } = useWorkspaceId();
  const { projectId } = useProjectId();

  const searchParams = {
    workspace: parseAsString,
    project: parseAsString,
    task: parseAsString,
  };
  const serialize = createSerializer(searchParams);

  const href = serialize("/workspaces/tasks", {
    workspace: workspaceId,
    project: projectId,
    task: id,
  }) as Route;

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    router.push(href);
  };
  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "text-primary flex cursor-pointer flex-col gap-y-1.5 rounded-md border border-l-4 bg-white p-1.5 text-xs transition hover:opacity-75",
          statusColorMap[status],
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee.name} />
          <div className="size-1 rounded-full bg-neutral-300">
            <ProjectAvatar name={project.name} image={project.thumbnail} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
