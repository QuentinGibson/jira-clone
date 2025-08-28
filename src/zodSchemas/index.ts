import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be 3 characters or longer")
    .max(156, "Name must be under 156 characters"),
  thumbnail: z.optional(z.instanceof(File)),
});
