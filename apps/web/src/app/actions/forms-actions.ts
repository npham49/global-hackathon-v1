"use server";

import { authActionClient } from "@/lib/safe-action";
import { createForm, getUserForms } from "@/data-access/forms";
import { z } from "zod";

// Create a simplified schema with only the fields we need
// This avoids the massive recursive type that breaks IntelliSense
// See: https://github.com/colinhacks/zod/issues/3233#issuecomment-2588511633
const formSchema = z.object({
  data: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    schema: z.any(),
  }),
});

export const createFormAction = authActionClient
  .inputSchema(formSchema)
  .action(async ({ parsedInput, ctx }) => {
    const form = await createForm(ctx.user.id, {
      ...parsedInput.data,
      createdByUser: {
        connect: { id: ctx.user.id },
      },
      updatedByUser: {
        connect: { id: ctx.user.id },
      },
    });
    return form;
  });

export const getCurrentUserForms = authActionClient.action(async ({ ctx }) => {
  const forms = await getUserForms(ctx.user.id);
  return forms;
});
