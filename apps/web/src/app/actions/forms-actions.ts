"use server";

import { authActionClient } from "@/lib/safe-action";
import { FeedbackFormCreateOneSchema } from "../../../prisma/generated/schema/schemas"; // Import the generated Zod schemas
import { createForm, getUserForms } from "@/data-access/forms";

export const createFormAction = authActionClient
  .inputSchema(FeedbackFormCreateOneSchema)
  .action(async ({ parsedInput, ctx }) => {
    const data = {
      ...parsedInput.data,
      createdByUser: {
        connect: { id: ctx.user.id },
      },
      updatedByUser: {
        connect: { id: ctx.user.id },
      },
    };

    const form = await createForm(ctx.user.id, data);
    return form;
  });

export const getCurrentUserForms = authActionClient.action(async ({ ctx }) => {
  const forms = await getUserForms(ctx.user.id);
  return forms;
});
