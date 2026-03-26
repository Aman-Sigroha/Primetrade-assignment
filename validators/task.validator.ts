import { z } from "zod";

export const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: "Title is required" })
      .trim()
      .min(1, "Title is required")
      .max(200),
    description: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .transform((s) => (s === undefined || s === "" ? undefined : s)),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .transform((s) => (s === undefined || s === "" ? undefined : s)),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "At least one of title or description must be provided",
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
