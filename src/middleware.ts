import {
  convexAuthNextjsMiddleware
} from "@convex-dev/auth/nextjs/server";
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'never' // URLs remain the same, locale stored in cookie
});

export default convexAuthNextjsMiddleware(async (request) => {
  // Apply internationalization middleware
  const intlResponse = intlMiddleware(request);
  
  // Let all requests pass through
  // Authentication protection is handled by:
  // 1. Dashboard layout for protected routes
  // 2. Login/Register pages for auth redirects
  
  // This middleware sets up both Convex Auth context and i18n
  return intlResponse;
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