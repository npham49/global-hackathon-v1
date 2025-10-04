import { z } from "zod";

// Create a simplified schema with only the fields we need
// This avoids the massive recursive type that breaks IntelliSense
// See: https://github.com/colinhacks/zod/issues/3233#issuecomment-2588511633
export const formSchema = z.object({
  data: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    schema: z.any(),
  }),
});

export const formUpdateSchema = z.object({
  data: z.object({
    id: z.string().min(1, "Form ID is required"),
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    schema: z.any().optional(),
  }),
});
