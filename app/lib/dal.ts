import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function verifySession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getUserProfile() {
  const user = await verifySession();
  const profile = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!profile) {
    throw new Error("User not found");
  }
  return profile;
}
