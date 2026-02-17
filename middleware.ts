import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleRequired: Record<string, string[]> = {
  "/dashboard/barbershops": ["owner", "co-owner"],
  "/dashboard": ["owner", "admin", "capster", "co-owner"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // role comes from jwt callback: token.role = user.role
    const role = req.nextauth.token?.role as string | undefined;

    const matchedPath = Object.keys(roleRequired).find((route) =>
      pathname.startsWith(route)
    );
    const allowedRoles = matchedPath ? roleRequired[matchedPath] : undefined;

    // If user has no token at all, redirect to sign in
    if (!req.nextauth.token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // If a route requires roles and user doesn't match, redirect away
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
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
