"use server";

import { authActionClient } from "@/lib/safe-action";
import {
  createForm,
  getUserForms,
  updateForm,
  getFormById,
  getFormSubmissions,
  getActiveFormToken,
  createFormToken,
  deleteAllFormTokens,
} from "@/data-access/forms";
import { formSchema, formUpdateSchema } from "@/lib/zod-schemas/forms";
import { getCurrentUserRolesByFormId } from "@/data-access/forms-users";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

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

export const formUpdateAction = authActionClient
  .inputSchema(formUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    // check for ownership or editor role
    const roles = await getCurrentUserRolesByFormId(
      ctx.user.id,
      parsedInput.data.id
    );
    if (!roles.includes("ADMIN") && !roles.includes("EDITOR")) {
      throw new Error("You do not have permission to update this form.");
    }

    // proceed with update
    const form = await updateForm(parsedInput.data.id, {
      ...parsedInput.data,
      updatedByUser: {
        connect: { id: ctx.user.id },
      },
    });
    return form;
  });

export const checkFormPermissionAndResturnFormIfOkay = authActionClient
  .inputSchema(z.object({ formId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const roles = await getCurrentUserRolesByFormId(
      ctx.user.id,
      parsedInput.formId
    );
    if (roles.length > 0) {
      const form = await getFormById(parsedInput.formId);
      return { hasPermission: true, form };
    }
    return { hasPermission: false };
  });

export const getFormByIdAction = authActionClient
  .inputSchema(z.object({ formId: z.string() }))
  .action(async ({ parsedInput }) => {
    const form = await getFormById(parsedInput.formId);
    return form;
  });

export const getFormWithSubmissionsAction = authActionClient
  .inputSchema(z.object({ formId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const roles = await getCurrentUserRolesByFormId(
      ctx.user.id,
      parsedInput.formId
    );
    if (roles.length === 0) {
      throw new Error("You do not have permission to view this form.");
    }

    const form = await getFormById(parsedInput.formId);
    const submissions = await getFormSubmissions(parsedInput.formId);
    const activeToken = await getActiveFormToken(parsedInput.formId);

    return { form, submissions, activeToken, isAdmin: roles.includes("ADMIN") };
  });

export const refreshFormTokenAction = authActionClient
  .inputSchema(z.object({ formId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const roles = await getCurrentUserRolesByFormId(
      ctx.user.id,
      parsedInput.formId
    );
    if (!roles.includes("ADMIN")) {
      throw new Error("Only admins can refresh form tokens.");
    }

    // Create new token valid for 30 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const token = await createFormToken(
      parsedInput.formId,
      createId().slice(0, 8),
      expiry,
      ctx.user.id
    );

    return token;
  });

export const disableFormSubmissionsAction = authActionClient
  .inputSchema(z.object({ formId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const roles = await getCurrentUserRolesByFormId(
      ctx.user.id,
      parsedInput.formId
    );
    if (!roles.includes("ADMIN")) {
      throw new Error("Only admins can disable form submissions.");
    }

    // Delete all tokens for this form
    await deleteAllFormTokens(parsedInput.formId);

    return { success: true };
  });
