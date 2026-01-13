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

// All barbershops for an owner
export async function getOwnerWithBarbershops(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      barbershops: {
        include: {
          capsters: true,
        },
      },
    },
  });
}

// Capster + their barbershop
export async function getCapsterWithBarbershop(userId: string) {
  return prisma.capster.findUnique({
    where: { userId },
    include: {
      barbershop: true,
    },
  });
}


// Barbershops for an owner with secure selection
export async function getBarbershopsForOwner(ownerId: string) {
  return prisma.barbershop.findMany({
    where: { ownerId },
    include: {
      services: true,
    },
  });
}
