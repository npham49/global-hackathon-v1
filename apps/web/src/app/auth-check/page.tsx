import { completeAuthCheck } from "../actions/user-actions";
import { Loader2 } from "lucide-react";

export default async function AuthCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/forms";

  await completeAuthCheck(redirectTo);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-muted-foreground">Please wait while we prepare everything for you.</p>
      </div>
    </div>
  )
}
