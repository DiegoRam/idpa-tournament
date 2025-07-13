import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login", 
    "/register",
    "/test", // Keep test route public for development
  ];

  // Skip auth check for public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // All dashboard routes require authentication
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    const authToken = request.cookies.get("convex-auth");
    
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes - will be enforced at component level with PermissionGate
  if (pathname.startsWith("/admin")) {
    const authToken = request.cookies.get("convex-auth");
    
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Tournament management routes - will be enforced at component level  
  if (pathname.startsWith("/tournaments/create") || pathname.startsWith("/tournaments/manage")) {
    const authToken = request.cookies.get("convex-auth");
    
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Scoring routes - will be enforced at component level
  if (pathname.startsWith("/scoring")) {
    const authToken = request.cookies.get("convex-auth");
    
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};