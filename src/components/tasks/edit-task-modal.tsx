"use client";

import ResponseModal from "@/components/responsive-modal";
import EditTaskFormWrapper from "./edit-task-form-wrapper";
import { useEditTaskModal } from "@/hooks/use-edit-task-modal";
import type { Id } from "convex/_generated/dataModel";

export const EditTaskModal = () => {
  const { taskId, close, setTaskId } = useEditTaskModal();

  return (
    <ResponseModal open={!!taskId} onOpenChange={close}>
      {taskId && (
        <EditTaskFormWrapper onCancel={close} id={taskId as Id<"tasks">} />
      )}
    </ResponseModal>
  );
};
