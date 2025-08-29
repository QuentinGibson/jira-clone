import CreateWorkSpaceForm from "@/components/workspaces/create-workspace-form";
import { useCreateWorkspaceModal } from "@/hooks/use-create-workspace-modal";

function WorkspaceCreatePage() {
  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkSpaceForm />
    </div>
  );
}

export default WorkspaceCreatePage;
