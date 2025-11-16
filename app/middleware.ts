import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const roleRequired: Record<string, string[]> = {
  "/dashboard": ["owner"],
};

export async function middleware(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const matchedPath = Object.keys(roleRequired).find((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  const allowedRoles = matchedPath ? roleRequired[matchedPath] : undefined;

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
  if (allowedRoles && (!session.user.role || !allowedRoles.includes(session.user.role))) {
    return NextResponse.redirect(new URL("/", req.url)); // or access denied page
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
