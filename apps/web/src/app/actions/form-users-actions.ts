"use server";

import { getCurrentUserRolesByFormId } from "@/data-access/forms-users";
import { authActionClient } from "@/lib/safe-action";
import z from "zod";

export const formRoleCheckAction = authActionClient
  .inputSchema(z.object({ id: z.string().min(1, "Form ID is required") }))
  .action(async ({ parsedInput, ctx }) => {
    // check for ownership or editor role
    const roles = await getCurrentUserRolesByFormId(
      ctx.user.id,
      parsedInput.id
    );
    if (!roles.includes("ADMIN") && !roles.includes("EDITOR")) {
      throw new Error("You do not have permission to update this form.");
    }
    return { message: "User has permission" };
  });
