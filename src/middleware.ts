import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Define route matchers
const isAuthPage = createRouteMatcher(["/login", "/register"]);
const isPublicRoute = createRouteMatcher(["/", "/test", "/debug"]);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/admin(.*)",
  "/tournaments(.*)",
  "/scoring(.*)"
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Let all requests pass through
  // Authentication protection is handled by:
  // 1. Dashboard layout for protected routes
  // 2. Login/Register pages for auth redirects
  
  // This middleware just sets up Convex Auth context
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes are handled by Convex Auth)
     */
    "/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"
  ],
};