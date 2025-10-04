"use server";

import { authActionClient } from "@/lib/safe-action";
import { getUserById, createUser } from "@/data-access/users";

export const ensureUserExists = authActionClient.action(async ({ ctx }) => {
  const userId = ctx.user.id;

  // Check if user exists
  const existingUser = await getUserById(userId);

  if (existingUser) {
    return { message: "User already exists" };
  }

  // Create the user if they don't exist
  const newUser = await createUser(userId);

  return newUser;
});
