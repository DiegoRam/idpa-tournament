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
  const isAuthenticated = await convexAuth.isAuthenticated();

  // Redirect authenticated users away from auth pages
  if (isAuthPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute(request) && !isAuthenticated) {
    const loginUrl = `/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
    return nextjsMiddlewareRedirect(request, loginUrl);
  }

  // Allow public routes and API routes to pass through
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