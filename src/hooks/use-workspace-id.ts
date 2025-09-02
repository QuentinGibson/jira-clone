import type { Id } from "convex/_generated/dataModel";
import { useQueryState } from "nuqs";

export const useWorkspaceId = () => {
  const [workspaceId, setWorkspaceId] = useQueryState("workspace", {
    clearOnDefault: true,
  });
  return { workspaceId: workspaceId as Id<"workspaces">, setWorkspaceId };
};
