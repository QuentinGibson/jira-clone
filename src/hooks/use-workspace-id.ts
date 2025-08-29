import { useQueryState } from "nuqs";

export const useWorkspaceId = () => {
  const [workspaceId, setWorkspaceId] = useQueryState("workspace", {
    clearOnDefault: true,
  });
  return { workspaceId, setWorkspaceId };
};
