"use server";

import { authActionClient } from "@/lib/safe-action";
import { getUserById, createUser } from "@/data-access/users";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function completeAuthCheck(redirectTo: string) {
  // Ensure user exists in database
  await ensureUserExists();

  // Set cookie to mark user as checked
  const cookieStore = await cookies();
  cookieStore.set("user-check-complete", "true", {
    path: "/",
    maxAge: 86400, // 24 hours
  });

  // Redirect to destination
  redirect(redirectTo);
}
