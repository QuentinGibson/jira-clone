"use client";

import ResponseModal from "@/components/responsive-modal";
import { useCreateTaskModal } from "@/hooks/use-create-task-modal";
import CreateTaskFormWrapper from "./create-task-form-wrapper";
import { useInitialStatusStore } from "@/hooks/initial-status-store";

export const CreateTaskModal = () => {
  const { isOpen, close, setIsOpen } = useCreateTaskModal();
  const { initialStatus } = useInitialStatusStore();

  return (
    <ResponseModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateTaskFormWrapper onCancel={close} initialStatus={initialStatus} />
    </ResponseModal>
  );
};
