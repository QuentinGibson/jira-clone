import { ConvexError } from "convex/values";
import { query } from "./_generated/server";

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
