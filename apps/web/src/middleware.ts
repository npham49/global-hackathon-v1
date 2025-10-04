import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/forms(.*)"]);
const isAuthCheckRoute = createRouteMatcher(["/auth-check"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Check if user has already been verified
    const hasUserCheck = req.cookies.get("user-check-complete");

    // If user is authenticated, hasn't been checked, and not on auth-check page
    if (!hasUserCheck && !isAuthCheckRoute(req)) {
      const url = new URL("/auth-check", req.url);
      url.searchParams.set(
        "redirectTo",
        req.nextUrl.pathname + req.nextUrl.search
      );
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
