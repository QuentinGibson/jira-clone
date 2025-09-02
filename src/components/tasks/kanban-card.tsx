import type { Doc } from "convex/_generated/dataModel";
import TaskActions from "../task-actions";
import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { MemberAvatar } from "../member-avatar";
import type { TaskWithDetails } from "types";
import TaskDate from "../task-date";
import { ProjectAvatar } from "../project-avatar";

interface KanbanCardProps {
  task: TaskWithDetails;
}
function KanbanCard({ task }: KanbanCardProps) {
  const { projectId } = useProjectId();
  const { workspaceId } = useWorkspaceId();
  return (
    <div className="mb-1.5 space-y-3 rounded bg-white p-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-x-2">
        <p>{task.name}</p>
        <TaskActions
          id={task._id}
          projectId={projectId}
          workspaceId={workspaceId}
        >
          <MoreHorizontal className="storke-1 size-[18px] shrink-0 text-neutral-700 transition hover:opacity-75" />
        </TaskActions>
      </div>
      <Separator />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assignee.name}
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-neutral-300" />
        <TaskDate value={task.dueDate} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project.name}
          image={task.project.thumbnail}
          fallbackClassName="text-[10px]"
        />
        <span className="text-sm font-medium">{task.project.name}</span>
      </div>
    </div>
  );
}

export default KanbanCard;
