import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { WorkspaceRole } from "../src/types.d.js";

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
});
