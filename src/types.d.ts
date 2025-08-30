import type { Doc } from "convex/_generated/dataModel";

export enum WorkspaceRole {
  Admin = "ADMIN",
  Member = "MEMBER",
}

export type Workspace = Doc<"workspaces">;
