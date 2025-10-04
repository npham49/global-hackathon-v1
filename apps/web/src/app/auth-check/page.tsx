"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { completeAuthCheck } from "../actions/user-actions";

function AuthCheckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/forms";

  useEffect(() => {
    async function setupUser() {
      try {
        await completeAuthCheck();
        // Redirect after cookie is set
        router.push(redirectTo);
      } catch (error) {
        console.error("Error setting up user:", error);
        // Redirect anyway to avoid infinite loop
        router.push(redirectTo);
      }
    }

    setupUser();
  }, [redirectTo, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-muted-foreground">Please wait while we prepare everything for you.</p>
      </div>
    </div>
  );
}

export default function AuthCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
            <p className="text-muted-foreground">Please wait while we prepare everything for you.</p>
          </div>
        </div>
      }
    >
      <AuthCheckContent />
    </Suspense>
  );
}
