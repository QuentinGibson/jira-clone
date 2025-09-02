import type { Id } from "convex/_generated/dataModel";
import { useQueryState } from "nuqs";

export const useProjectId = () => {
  const [projectId, setProjectId] = useQueryState("project", {
    clearOnDefault: true,
  });
  return { projectId: projectId as Id<"projects">, setProjectId };
};
