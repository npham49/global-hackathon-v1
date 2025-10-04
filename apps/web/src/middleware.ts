import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/forms(.*)", "/auth-check"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Check if user has already been verified (skip for auth-check route)
    if (req.nextUrl.pathname !== "/auth-check") {
      const hasUserCheck = req.cookies.get("user-check-complete");

      if (!hasUserCheck) {
        const url = new URL("/auth-check", req.url);
        url.searchParams.set(
          "redirectTo",
          req.nextUrl.pathname + req.nextUrl.search
        );
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|map)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
