import {
  convexAuthNextjsMiddleware
} from "@convex-dev/auth/nextjs/server";


export default convexAuthNextjsMiddleware(async () => {
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