"use client";
import { useQueryState, parseAsBoolean } from "nuqs";
import type { TaskStatus } from "types";
import { useInitialStatusStore } from "./initial-status-store";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const { changeStatus } = useInitialStatusStore();

  const open = () => setIsOpen(true);
  const openWithStatus = (initialStatus: TaskStatus) => {
    changeStatus(initialStatus);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    openWithStatus,
  };
};
