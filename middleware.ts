import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = [
  "/dashboard",
  "/companies",
  "/reports",
  "/follow-up",
  "/tasks",
  "/announcements",
  "/more",
  "/admin",
];

function startsWithRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function redirectWithSessionCookies(
  request: NextRequest,
  destination: string,
  sessionResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(new URL(destination, request.url));

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) =>
    startsWithRoute(pathname, route),
  );

  if (isProtectedRoute && !user) {
    return redirectWithSessionCookies(request, "/login", response);
  }

  if (pathname === "/login" && user) {
    return redirectWithSessionCookies(request, "/dashboard", response);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/companies/:path*",
    "/reports/:path*",
    "/follow-up/:path*",
    "/tasks/:path*",
    "/announcements/:path*",
    "/more/:path*",
    "/admin/:path*",
  ],
};
