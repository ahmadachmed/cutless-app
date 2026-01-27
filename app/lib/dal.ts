import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BarbershopFormSchema } from "@/app/lib/definitions";

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

export async function createBarbershop(data: unknown, ownerId: string) {
    const validation = BarbershopFormSchema.safeParse(data);
    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    const { name, address, phoneNumber, subscriptionPlan, openTime, closeTime, breakStartTime, breakEndTime, daysOpen } = validation.data;

    const existingBarbershop = await prisma.barbershop.findUnique({
        where: { name },
    });

    if (existingBarbershop) {
        return { error: "Barbershop name must be unique", code: 409 };
    }

    try {
        const barbershop = await prisma.barbershop.create({
            data: {
                name,
                address,
                phoneNumber,
                subscriptionPlan,
                openTime,
                closeTime,
                breakStartTime,
                breakEndTime,
                daysOpen,
                ownerId,
            },
        });
        return { barbershop };
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === "P2002") {
            return { error: "Barbershop name must be unique", code: 409 };
        }
        throw new Error("Failed to create barbershop");
    }
}

export async function updateBarbershop(data: unknown, ownerId: string) {
    const validation = BarbershopFormSchema.safeParse(data);
    if (!validation.success) {
        return { errors: validation.error.flatten().fieldErrors };
    }

    const { id, name, address, phoneNumber, subscriptionPlan, openTime, closeTime, breakStartTime, breakEndTime, daysOpen } = validation.data;

    if (!id) {
        return { error: "Missing id", code: 400 };
    }

    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop || barbershop.ownerId !== ownerId) {
        return { error: "Not found or unauthorized", code: 403 };
    }

    try {
        const updatedBarbershop = await prisma.barbershop.update({
            where: { id },
            data: {
                name,
                address,
                phoneNumber,
                subscriptionPlan,
                openTime,
                closeTime,
                breakStartTime,
                breakEndTime,
                daysOpen,
                updatedAt: new Date(),
            },
        });
        return { barbershop: updatedBarbershop };
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === "P2002") {
            return { error: "Barbershop name must be unique", code: 409 };
        }
        throw new Error("Failed to update barbershop");
    }
}

export async function deleteBarbershop(id: string, ownerId: string) {
    if (!id) {
        return { error: "Missing id", code: 400 };
    }

    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop || barbershop.ownerId !== ownerId) {
        return { error: "Not found or unauthorized", code: 403 };
    }

    try {
        await prisma.$transaction(async (prismaTx) => {
            await prismaTx.capster.deleteMany({ where: { barbershopId: id } });
            await prismaTx.barbershop.delete({ where: { id } });
        });
        return { message: "Barbershop deleted successfully" };
    } catch {
        throw new Error("Failed to delete barbershop");
    }
}
