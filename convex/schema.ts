import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  members: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
  })
    .index("by_userId", ["userId"])
    .index("by_workspaceId", ["workspaceId"]),
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    thumbnail: v.optional(v.id("_storage")),
  })
    .index("by_userId", ["userId"])
    .index("by_name", ["name"]),
});
