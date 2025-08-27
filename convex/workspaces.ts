import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
      .withIndex("by_user", (q) => q.eq("user", user._id))
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

    return await ctx.db.insert("workspaces", {
      name,
      user: user._id,
      thumbnail,
    });
  },
});
