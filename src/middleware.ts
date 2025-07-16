import {
  convexAuthNextjsMiddleware
} from "@convex-dev/auth/nextjs/server";

export default convexAuthNextjsMiddleware();

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