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

// All barbershops for an owner (or single for admin/capster)
export async function getOwnerWithBarbershops(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user) return null;

  let barbershops: any[] = [];

  if (user.role === "owner") {
      barbershops = await prisma.barbershop.findMany({
          where: { ownerId: userId, deletedAt: null },
          include: { capsters: true }
      });
  }

  // Also check for secondary ownership/linkage via Capster for all roles including owner
  if (user.role === "owner" || user.role === "admin" || user.role === "capster" || user.role === "co-owner") {
      // Find the barbershop this user belongs to
      const capsterEntry = await prisma.capster.findUnique({
          where: { userId },
          include: { 
              barbershop: {
                  include: { capsters: true }
              } 
          }
      });
      
      if (capsterEntry?.barbershop) {
           // Add if not already present
          if (!barbershops.find(b => b.id === capsterEntry.barbershopId)) {
              barbershops.push(capsterEntry.barbershop);
          }
      }
  }

  return { ...user, barbershops };
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
// Barbershops for an owner with secure selection
// DEPRECATED: Use getBarbershopsForUser instead
// export async function getBarbershopsForOwner(ownerId: string) {
//   return prisma.barbershop.findMany({
//     where: { 
//       ownerId,
//       deletedAt: null // Exclude soft-deleted barbershops
//     },
//     include: {
//       services: true,
//     },
//   });
// }

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

    // Check for existing barbershop with same name (excluding soft-deleted ones)
    const existingBarbershop = await prisma.barbershop.findFirst({
        where: { 
            name,
            deletedAt: null // Only check active barbershops
        },
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
        // Soft delete: just set deletedAt timestamp
        await prisma.barbershop.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return { message: "Barbershop deleted successfully" };
    } catch {
        throw new Error("Failed to delete barbershop");
    }
}


// Barbershops for a user (Owner: all owned + linked, Admin/Capster: linked shop)
export async function getBarbershopsForUser(userId: string) {
  const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
  });

  if (!user) return [];

  let barbershops: any[] = [];

  // Primary ownership (for owners)
  if (user.role === "owner") {
      barbershops = await prisma.barbershop.findMany({
          where: { ownerId: userId, deletedAt: null },
          include: { services: true },
      });
  }

  // Linked ownership (for owners, admins, capsters)
  // Owners can be "secondary owners" in other shops
  if (user.role === "owner" || user.role === "admin" || user.role === "capster" || user.role === "co-owner") {
      const capster = await prisma.capster.findUnique({
          where: { userId },
          include: { barbershop: { include: { services: true } } }
      });
      
      if (capster?.barbershop) {
          // Add if not already present (for owners who might be linked to their own shop or another)
          if (!barbershops.find(b => b.id === capster.barbershopId)) {
              barbershops.push(capster.barbershop);
          }
      }
  }

  return barbershops;
}

// Capsters for a user (Owner: all in owned/linked shops, Admin: all in same shop)
export async function getCapstersForUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
  
    if (!user) return [];
  
    let barbershopIds: string[] = [];
  
    if (user.role === "owner") {
        const shops = await prisma.barbershop.findMany({
            where: { ownerId: userId, deletedAt: null },
            select: { id: true }
        });
        barbershopIds = shops.map(s => s.id);
    }
    
  // Also check for secondary ownership/linkage via Capster for all roles including owner
  if (user.role === "owner" || user.role === "admin" || user.role === "capster" || user.role === "co-owner") {
        const capster = await prisma.capster.findUnique({
            where: { userId },
            select: { barbershopId: true }
        });
        if (capster?.barbershopId && !barbershopIds.includes(capster.barbershopId)) {
            barbershopIds.push(capster.barbershopId);
        }
    }
  
    return prisma.capster.findMany({
        where: { barbershopId: { in: barbershopIds } },
        include: {
            user: true, 
            barbershop: true
        }
    });
}

// Keeping original for backward compatibility if needed, but redirects to new logic if specific ownerId concept is loose
export async function getCapstersForOwner(ownerId: string) {
    return getCapstersForUser(ownerId);
}

export async function getBarbershopsForOwner(ownerId: string) {
    return getBarbershopsForUser(ownerId);
}

