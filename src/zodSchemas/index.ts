import z from "zod";
import { TaskStatus } from "../../types";

// Define TaskStatus locally if global declaration isn't working
// const TaskStatus = {
//   Backlog: "BACKLOG",
//   Todo: "TODO",
//   In_Progress: "IN_PROGRESS",
//   In_Review: "IN_REVIEW",
//   Done: "DONE",
// } as const;

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be 3 characters or longer")
    .max(156, "Name must be under 156 characters"),
  thumbnail: z.instanceof(File).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be 3 characters or longer")
    .max(156, "Name must be under 156 characters")
    .optional(),
  thumbnail: z.instanceof(File).optional(),
});

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be 3 characters or longer")
    .max(156, "Name must be under 156 characters"),
  thumbnail: z.instanceof(File).optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be 3 characters or longer")
    .max(156, "Name must be under 156 characters")
    .optional(),
  thumbnail: z.instanceof(File).optional(),
});

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  dueDate: z.number(),
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().trim().min(1).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  workspaceId: z.string().trim().min(1).optional(),
  projectId: z.string().trim().min(1).optional(),
  dueDate: z.number().optional(),
  assigneeId: z.string().trim().min(1).optional(),
  description: z.string().optional(),
});
