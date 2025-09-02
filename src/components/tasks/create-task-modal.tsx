"use client";

import ResponseModal from "@/components/responsive-modal";
import { useCreateTaskModal } from "@/hooks/use-create-task-modal";
import CreateTaskFormWrapper from "./create-task-form-wrapper";

export const CreateTaskModal = () => {
  const { isOpen, close, setIsOpen } = useCreateTaskModal();

  return (
    <ResponseModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateTaskFormWrapper onCancel={close} />
    </ResponseModal>
  );
};
