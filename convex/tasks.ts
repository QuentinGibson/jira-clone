import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { WorkspaceRole } from "./types.d";
import { workspaceRoleValidator } from "./schema";

export const create = mutation({
  args: {
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
    workspaceId: v.id("workspaces"),
  },
  returns: v.id("tasks"),
  handler: async (
    ctx,
    { name, projectId, assigneeId, dueDate, status, workspaceId },
  ) => {
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

    let position = 0;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    if (tasks) {
      const highestPositionTask = Math.max(
        ...tasks.map((task) => task.position),
      );
      position = highestPositionTask + 1000;
    }

    const taskId = await ctx.db.insert("tasks", {
      workspaceId,
      projectId,
      name,
      dueDate,
      status,
      position,
      assigneeId,
    });

    return taskId;
  },
});

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("BACKLOG"),
        v.literal("TODO"),
        v.literal("IN_PROGRESS"),
        v.literal("IN_REVIEW"),
        v.literal("DONE"),
      ),
    ),
    search: v.optional(v.string()),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { workspaceId, projectId, search, status, assigneeId, dueDate },
  ) => {
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

    let tasks;

    if (search && search.trim() !== "") {
      // Use search index with optional filters
      tasks = await ctx.db
        .query("tasks")
        .withSearchIndex("search_name", (q) => {
          let s = q.search("name", search);
          if (projectId) s.eq("projectId", projectId);
          if (workspaceId) s.eq("workspaceId", workspaceId);
          if (status) s.eq("status", status);
          if (assigneeId) s.eq("assigneeId", assigneeId);
          if (dueDate) s.eq("dueDate", dueDate);

          return s;
        })
        .collect();
    } else {
      // Use regular index when no search text
      let query = ctx.db
        .query("tasks")
        .withIndex("by_workspace_project", (q) =>
          q.eq("workspaceId", workspaceId).eq("projectId", projectId),
        );

      if (status) query = query.filter((q) => q.eq(q.field("status"), status));
      if (dueDate)
        query = query.filter((q) => q.eq(q.field("dueDate"), dueDate));
      if (assigneeId)
        query = query.filter((q) => q.eq(q.field("assigneeId"), assigneeId));

      tasks = await query.collect();
    }

    // Enrich tasks with assignee and project data
    return await Promise.all(
      tasks.map(async (task) => {
        const assignee = await ctx.db.get(task.assigneeId);
        const project = await ctx.db.get(task.projectId);

        if (!assignee) {
          throw new ConvexError("No assignee found!");
        }
        if (!project) {
          throw new ConvexError("No project found!");
        }

        return {
          ...task,
          assignee,
          project,
        };
      }),
    );
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { workspaceId, taskId }) => {
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
      .withIndex("by_workspaceId_userId", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", user._id),
      )
      .unique();
    if (!userMemberships) throw new ConvexError("Unauthorized");

    if (userMemberships.role !== WorkspaceRole.Admin) {
      throw new ConvexError("Unauthorized");
    }

    const task = await ctx.db.get(taskId);
    if (!task) {
      console.log("Task does not exist");
      return;
    }

    await ctx.db.delete(taskId);

    console.log(`Successfully deleted ${task.name}`);
  },
});

export const edit = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("tasks"),
    taskName: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    assigneeId: v.optional(v.id("users")),
    status: v.optional(
      v.union(
        v.literal("BACKLOG"),
        v.literal("TODO"),
        v.literal("IN_PROGRESS"),
        v.literal("IN_REVIEW"),
        v.literal("DONE"),
      ),
    ),
    description: v.optional(v.string()),
    taskProject: v.optional(v.id("projects")),
    position: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      workspaceId,
      description,
      taskId,
      taskName,
      dueDate,
      assigneeId,
      status,
      taskProject,
      position,
    },
  ) => {
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
      .withIndex("by_workspaceId_userId", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", user._id),
      )
      .unique();
    if (!userMemberships) throw new ConvexError("Unauthorized");

    const oldTask = await ctx.db.get(taskId);

    if (!oldTask) {
      throw new ConvexError("Task does not exist");
    }

    const updates: any = {};
    if (taskName !== undefined) updates.name = taskName;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (assigneeId !== undefined) updates.assigneeId = assigneeId;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (taskProject !== undefined) updates.projectId = taskProject;
    if (position !== undefined) updates.position = position;

    await ctx.db.patch(taskId, updates);

    console.log(`${oldTask.name} updated with new values!`);
  },
});

export const getById = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { workspaceId, projectId, taskId }) => {
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
      .withIndex("by_workspaceId_userId", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", user._id),
      )
      .unique();
    if (!userMemberships) throw new ConvexError("Unauthorized");

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new ConvexError("No task found!");
    }
    return task;
  },
});
