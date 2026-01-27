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

export async function getAppointmentsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) return [];

  let whereClause = {};

  if (user.role === "owner") {
    const barbershops = await prisma.barbershop.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const barbershopIds = barbershops.map((b) => b.id);
    whereClause = { barbershopId: { in: barbershopIds } };
  } else if (user.role === "capster") {
    const capster = await prisma.capster.findUnique({
      where: { userId: userId }
    });
    if (capster) {
       whereClause = { capsterId: capster.id };
    } else {
       return [];
    }
  } else {
    // Customer or other
    whereClause = { customerId: userId };
  }

  return prisma.appointment.findMany({
    where: whereClause,
    include: {
      service: true,
      barbershop: true,
      capster: {
        include: {
          user: { select: { name: true } }
        }
      },
      customer: { select: { name: true, email: true } }
    },
    orderBy: { date: 'asc' }
  });
}
