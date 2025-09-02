import { snakeCaseToTitleCase } from "@/lib/utils";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashed,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { TaskStatus } from "types";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useCreateTaskModal } from "@/hooks/use-create-task-modal";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskcount: number;
}

const statusIconMap: Record<TaskStatus, ReactNode> = {
  [TaskStatus.Backlog]: (
    <CircleDashedIcon className="size-[18px] text-pink-400" />
  ),
  [TaskStatus.Todo]: <CircleDashedIcon className="size-[18px] text-red-400" />,
  [TaskStatus.In_Progress]: (
    <CircleDotDashed className="size-[18px] text-yellow-400" />
  ),
  [TaskStatus.In_Review]: (
    <CircleDotIcon className="size-[18px] text-blue-400" />
  ),
  [TaskStatus.Done]: (
    <CircleCheckIcon className="size-[18px] text-emerald-400" />
  ),
};

function KanbanColumnHeader({ board, taskcount }: KanbanColumnHeaderProps) {
  const { openWithStatus } = useCreateTaskModal();
  const icon = statusIconMap[board];

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
        <div className="flex size-5 items-center justify-center rounded-md bg-neutral-200 text-sm font-medium text-neutral-700">
          {taskcount}
        </div>
      </div>
      <Button
        onClick={() => {
          openWithStatus(board);
        }}
        variant="ghost"
        size="icon"
        className="size-5"
      >
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
}

export default KanbanColumnHeader;
