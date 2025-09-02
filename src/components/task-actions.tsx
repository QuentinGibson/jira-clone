import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Pencil } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import useConfirm from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { createSerializer, parseAsString } from "nuqs";
import type { Route } from "next";
import { useEditTaskModal } from "@/hooks/use-edit-task-modal";

interface TaskActionsProps {
  id: Id<"tasks">;
  workspaceId: Id<"workspaces">;
  projectId: string;
  children: ReactNode;
}

function TaskActions({
  id,
  workspaceId,
  projectId,
  children,
}: TaskActionsProps) {
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Delete Task",
    message: "This action can not be undone.",
    variant: "destructive",
  });
  const { mutateAsync: deleteTask, isPending: pendingDelete } = useMutation({
    mutationFn: useConvexMutation(api.tasks.remove),
  });

  const { open } = useEditTaskModal();

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    deleteTask({ workspaceId, taskId: id });
  };

  const onOpenProject = async () => {
    const searchParams = {
      workspace: parseAsString,
      project: parseAsString,
    };
    const serialize = createSerializer(searchParams);
    const href = serialize("/workspaces/projects", {
      workspace: workspaceId,
      project: projectId,
    }) as Route;
    router.push(href);
  };

  const onOpenTask = async () => {
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
    router.push(href);
  };

  return (
    <div className="flex justify-center">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => {}} className="p-[10px] font-medium">
            <ExternalLink
              className="mr-2 size-4 stroke-2"
              onClick={onOpenTask}
            />
            Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="p-[10px] font-medium"
            onClick={onOpenProject}
          >
            <ExternalLink className="mr-2 size-4 stroke-2" />
            Open Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => open(id)}
            className="p-[10px] font-medium"
          >
            <Pencil className="mr-2 size-4 stroke-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={pendingDelete}
            className="focus: p-[10px] font-medium text-orange-700 focus:text-amber-700"
          >
            <ExternalLink className="mr-2 size-4 stroke-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default TaskActions;
