"use client";
import ResponsiveModal from "./responsive-modal";
import CreateWorkSpaceForm from "./workspaces/create-workspace-form";
import { useCreateWorkspaceModal } from "@/hooks/use-create-workspace-modal";

function CreateWorkspaceModal() {
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkSpaceForm onCancel={close} />
    </ResponsiveModal>
  );
}

export default CreateWorkspaceModal;
