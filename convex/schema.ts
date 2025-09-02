import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { WorkspaceRole } from "./types.d";

export const workspaceRoleValidator = v.union(
  v.literal(WorkspaceRole.Member),
  v.literal(WorkspaceRole.Admin),
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  members: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: workspaceRoleValidator,
  })
    .index("by_userId", ["userId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspaceId_userId", ["workspaceId", "userId"]),
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    thumbnail: v.optional(v.id("_storage")),
    inviteCode: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_name", ["name"])
    .index("by_inviteCode", ["inviteCode"]),
  projects: defineTable({
    name: v.string(),
    thumbnail: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
  }).index("by_workspaceId", ["workspaceId"]),
  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    projectId: v.id("projects"),
    assigneeId: v.id("users"),
    description: v.optional(v.string()),
    dueDate: v.number(),
    status: v.union(
      v.literal("BACKLOG"),
      v.literal("TODO"),
      v.literal("IN_PROGRESS"),
      v.literal("IN_REVIEW"),
      v.literal("DONE"),
    ),
    position: v.number(),
  })
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: [
        "dueDate",
        "status",
        "position",
        "assigneeId",
        "workspaceId",
        "projectId",
      ],
    })
    .index("by_projectId", ["projectId"])
    .index("by_workspace_project", ["workspaceId", "projectId"]),
});
