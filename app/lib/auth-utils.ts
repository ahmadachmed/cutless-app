import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireSession(context: any) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function requireRole(session: Session | null, roles: string[]) {
  if (!session) {
    throw new Error("Unauthorized: No session found");
  }
  if (!session.user) {
    throw new Error("Unauthorized: User not found in session");
  }
  const userRole = session.user.role;
  if (!userRole) {
    throw new Error("Unauthorized: User role not set in session");
  }
  if (!roles.includes(userRole)) {
    throw new Error(`Forbidden: User role "${userRole}" not permitted`);
  }
}
