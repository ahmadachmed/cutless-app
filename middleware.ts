import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/permissions";

// Map incoming path prefixes to permission keys defined in PERMISSIONS
const PATH_TO_PERMISSION: [string, string][] = [
  ["/dashboard/barbershops", "barbershop"],
  ["/dashboard/teams", "teams"],
  ["/dashboard/appointments", "calendar"],
  ["/dashboard/services", "services"],
  ["/dashboard/book", "book"],
  ["/dashboard", "dashboard"],
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // If user has no token at all, redirect to sign in
    if (!req.nextauth.token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // role comes from jwt callback: token.role = user.role
    const role = req.nextauth.token?.role as string | undefined;

    // Find the first matching path mapping
    const matched = PATH_TO_PERMISSION.find(([prefix]) => pathname.startsWith(prefix));
    if (!matched) return NextResponse.next();

    const permissionKey = matched[1];
    const allowed = PERMISSIONS[permissionKey];

    // If permission is null => any authenticated user allowed
    if (allowed === null) return NextResponse.next();

    // If allowed is undefined (unknown key) or role is missing or not included => redirect
    if (!allowed || !role || !allowed.includes(role as any)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow authenticated users to reach the middleware logic
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
