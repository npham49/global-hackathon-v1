import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ensureUserExists } from "../actions/user-actions";

export default async function AuthCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/forms";

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
