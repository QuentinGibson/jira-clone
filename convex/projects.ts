import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { queryGeneric } from "convex/server";
import { Id } from "./_generated/dataModel";
import { redirect } from "next/navigation";
import { WorkspaceRole } from "./types.d";

export const list = query({
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
    const hasMemberships = !!userMemberships.find(
      (membership) => membership.workspaceId === workspaceId,
    );
    if (!hasMemberships) throw new ConvexError("Unauthorized");

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return Promise.all(
      projects.map(async (project) => {
        return {
          ...project,
          thumbnail: project?.thumbnail
            ? await ctx.storage.getUrl(project.thumbnail)
            : null,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    thumbnail: v.optional(v.id("_storage")),
  },
  returns: v.id("projects"),
  handler: async (ctx, { workspaceId, name, thumbnail }) => {
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
      (membership) => membership.workspaceId === workspaceId,
    );
    if (!hasMemberships) throw new ConvexError("Unauthorized");

    const id = await ctx.db.insert("projects", {
      name,
      thumbnail,
      workspaceId,
    });
    console.log(`Project created: ${id}`);
    return id;
  },
});

export const get = query({
  args: { projectId: v.id("projects"), workspaceId: v.id("workspaces") },
  handler: async (ctx, { projectId, workspaceId }) => {
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
      (membership) => membership.workspaceId === workspaceId,
    );
    if (!hasMemberships) throw new ConvexError("Unauthorized");

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    if (project.workspaceId !== workspaceId) {
      throw new ConvexError("Unauthorized");
    }
    const projectWithImage = {
      ...project,
      thumbnail: project?.thumbnail
        ? await ctx.storage.getUrl(project.thumbnail)
        : null,
    };

    return projectWithImage;
  },
});

export const updateById = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    thumbnail: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { workspaceId, projectId, name, thumbnail }) => {
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
      (membership) => membership.workspaceId === workspaceId,
    );
    if (!hasMemberships) throw new ConvexError("Unauthorized");

    await ctx.db.patch(projectId, {
      name,
      thumbnail,
    });

    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError("Project not found");

    console.log(`Successfully Updated: ${project.name}.`);
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces"), projectId: v.id("projects") },
  handler: async (ctx, { workspaceId, projectId }) => {
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

    const role = currentMembership.role;

    if (role !== WorkspaceRole.Admin) {
      throw new ConvexError("Unauthorized");
    }

    const project = await ctx.db.get(projectId);
    if (!project) return;
    await ctx.db.delete(projectId);

    console.log(`Deleted project ${project.name}.`);
  },
});
