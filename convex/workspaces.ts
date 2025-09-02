import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { WorkspaceRole } from "./types.d";
import { generateInviteCode } from "../src/lib/utils.js";
export const list = query({
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

    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return Promise.all(
      workspaces.map(async (workspace) => {
        return {
          ...workspace,
          thumbnail: workspace.thumbnail
            ? await ctx.storage.getUrl(workspace.thumbnail)
            : null,
        };
      }),
    );
  },
});

export const create = mutation({
  args: { name: v.string(), thumbnail: v.optional(v.id("_storage")) },
  returns: v.id("workspaces"),
  handler: async (ctx, { name, thumbnail }) => {
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

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
    if (workspace) {
      throw new ConvexError(
        "Workspace name is not unique. Please try again with a different name",
      );
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name,
      userId: user._id,
      thumbnail,
    });

    await ctx.db.insert("members", {
      userId: user._id,
      workspaceId,
      role: WorkspaceRole.Admin,
    });

    return workspaceId;
  },
});

export const getWorkplaceById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, { id }) => {
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

    const userMemberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const hasMemberships = !!userMemberships.find(
      (membership) => membership.workspaceId === id,
    );
    if (!hasMemberships) throw new ConvexError("Unauthorized");
    const workspace = await ctx.db.get(id);
    if (!workspace) {
      throw new ConvexError("No workspace exists");
    }
    return workspace;
  },
});

export const updateById = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    thumbnail: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { id, name, thumbnail }) => {
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

    const userMemberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const hasMemberships = !!userMemberships.find(
      (membership) => membership.workspaceId === id,
    );
    if (!hasMemberships) throw new ConvexError("Unauthorized");

    await ctx.db.patch(id, {
      name,
      thumbnail,
    });

    console.log(`Successfully Updated: ${id}.`);
  },
});

export const remove = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, { id }) => {
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

    const userMemberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const currentMembership = userMemberships.find(
      (membership) => membership.workspaceId === id,
    );
    if (!currentMembership) {
      throw new ConvexError("Unauthorized");
    }

    const role = currentMembership.role;

    if (role !== WorkspaceRole.Admin) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(id);
    console.log(`Deleted workspace ${id}.`);
  },
});

export const generateWorkspaceInviteCode = mutation({
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

    const userMemberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const currentMembership = userMemberships.find(
      (membership) => membership.workspaceId === workspaceId,
    );
    if (!currentMembership || currentMembership.role !== WorkspaceRole.Admin) {
      throw new ConvexError("Unauthorized");
    }

    let inviteCode: string = "";
    let isUnique = false;

    // Generate unique invite code
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existingWorkspace = await ctx.db
        .query("workspaces")
        .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
        .first();
      if (!existingWorkspace) {
        isUnique = true;
      }
    }

    await ctx.db.patch(workspaceId, { inviteCode });
    return inviteCode;
  },
});

export const getWorkspaceInviteCode = query({
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

    const userMemberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const currentMembership = userMemberships.find(
      (membership) => membership.workspaceId === workspaceId,
    );
    if (!currentMembership) {
      throw new ConvexError("Unauthorized");
    }

    const workspace = await ctx.db.get(workspaceId);
    return workspace?.inviteCode || null;
  },
});

export const getWorkspaceByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, { inviteCode }) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
      .first();

    if (!workspace) {
      throw new ConvexError("Invalid invite code");
    }

    return {
      _id: workspace._id,
      name: workspace.name,
      thumbnail: workspace.thumbnail
        ? await ctx.storage.getUrl(workspace.thumbnail)
        : null,
    };
  },
});

export const joinWorkspaceByInviteCode = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, { inviteCode }) => {
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

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
      .first();

    if (!workspace) {
      throw new ConvexError("Invalid invite code");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), workspace._id))
      .first();

    if (existingMembership) {
      return workspace._id; // Already a member, just return workspace ID
    }

    // Add user as member
    await ctx.db.insert("members", {
      userId: user._id,
      workspaceId: workspace._id,
      role: WorkspaceRole.Member,
    });

    return workspace._id;
  },
});
