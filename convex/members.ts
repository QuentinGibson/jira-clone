import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { WorkspaceRole } from "./types.d";

export const listUserWorkspaces = query({
  handler: async (ctx, {}) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return Promise.all(
      memberships.map((membership) => {
        const workspace = ctx.db.get(membership.workspaceId);
        return workspace;
      }),
    );
  },
});

export const listWorkspaceMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const existingMembership = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), workspaceId))
      .first();

    if (!existingMembership) {
      throw new ConvexError("Unauthorized");
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const result = await Promise.all(
      members.map(async (memberId) => {
        return await ctx.db.get(memberId.userId);
      }),
    );

    const filterNull = result.filter((res) => res !== null);
    return filterNull;
  },
});

export const remove = mutation({
  args: { memberId: v.id("users"), workspaceId: v.id("workspaces") },
  handler: async (ctx, { memberId, workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const existingMembership = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), workspaceId))
      .first();

    if (
      !existingMembership ||
      existingMembership.role !== WorkspaceRole.Admin
    ) {
      throw new ConvexError("Unauthorized");
    }

    const membership = await ctx.db
      .query("members")
      .withIndex("by_workspaceId_userId", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", memberId),
      )
      .first();

    if (!membership) {
      throw new ConvexError("User is already not a member");
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    if (members.length === 1) {
      throw new ConvexError("Can not delete last member");
    }

    await ctx.db.delete(membership._id);
    console.log(
      `Deleted membership for ${user.name} in the workspace ${workspaceId}`,
    );
  },
});

export const changeRole = mutation({
  args: {
    memberId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: v.union(
      v.literal(WorkspaceRole.Admin),
      v.literal(WorkspaceRole.Member),
    ),
  },
  handler: async (ctx, { memberId, workspaceId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const existingMembership = await ctx.db
      .query("members")
      .withIndex("by_workspaceId_userId", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", user._id),
      )
      .first();

    if (
      !existingMembership ||
      existingMembership.role !== WorkspaceRole.Admin
    ) {
      throw new ConvexError("Unauthorized");
    }

    const membership = await ctx.db
      .query("members")
      .withIndex("by_workspaceId_userId", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", memberId),
      )
      .first();

    if (!membership) {
      throw new ConvexError("User is already not a member");
    }

    await ctx.db.patch(membership._id, { role });
    console.log(`Updated user to ${role}`);
  },
});
