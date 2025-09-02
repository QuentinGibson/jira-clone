export enum WorkspaceRole {
  Admin = "ADMIN",
  Member = "MEMBER",
}

export enum TaskStatus {
  Backlog = "BACKLOG",
  Todo = "TODO",
  In_Progress = "IN_PROGRESS",
  In_Review = "IN_REVIEW",
  Done = "DONE",
}

export type Workspace = Doc<"workspaces">;
