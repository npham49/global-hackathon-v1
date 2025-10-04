"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ensureUserExists } from "../actions/user-actions";

export default function AuthCheckPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/forms";

  useEffect(() => {
    const checkAndCreateUser = async () => {
      try {
        const result = await ensureUserExists();

        if (result?.data || result?.serverError === "User already exists") {
          // Set cookie to mark user as checked
          document.cookie = "user-check-complete=true; path=/; max-age=86400"; // 24 hours

          // User exists or was created successfully, redirect to original destination
          router.push(redirectTo);
          router.refresh();
        } else {
          // Something went wrong
          console.error("Failed to ensure user exists:", result);
          // Set cookie anyway to avoid infinite loop
          document.cookie = "user-check-complete=true; path=/; max-age=86400";
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        // Set cookie anyway to avoid infinite loop
        document.cookie = "user-check-complete=true; path=/; max-age=86400";
        router.push(redirectTo);
      }
    };

    checkAndCreateUser();
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
