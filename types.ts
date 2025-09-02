import type { Doc } from "convex/_generated/dataModel";

export enum WorkspaceRole {
  Admin = "ADMIN",
  Member = "MEMBER",
}

export type TaskState = {
  [key in TaskStatus]: TaskWithDetails[];
};

export enum TaskStatus {
  Backlog = "BACKLOG",
  Todo = "TODO",
  In_Progress = "IN_PROGRESS",
  In_Review = "IN_REVIEW",
  Done = "DONE",
}

export type TaskWithDetails = Doc<"tasks"> & {
  assignee: Doc<"users">;
  project: Doc<"projects">;
};
export type Workspace = Doc<"workspaces">;
