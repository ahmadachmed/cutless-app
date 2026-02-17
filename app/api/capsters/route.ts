import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";


// const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For owners, show capsters linked to their barbershops (primary) OR linked via Capster (secondary)
  // For admins/capsters, show capsters linked to *their* barbershop
  let capsters: unknown[] = [];
  
  const barbershopIds = new Set<string>();

  if (session.user?.role === "owner") {
    // 1. Get barbershops owned by this user
    const ownedBarbershops = await prisma.barbershop.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    ownedBarbershops.forEach(b => barbershopIds.add(b.id));
  }
  

  // 2. Get barbershop linked via Capster (for everyone including Owner who might be secondary)
  if (session.user?.role === "owner" || session.user?.role === "admin" || session.user?.role === "capster" || session.user?.role === "co-owner") {
     const linkedCapster = await prisma.capster.findUnique({
         where: { userId: session.user.id },
         select: { barbershopId: true }
     });

     if (linkedCapster) {
         barbershopIds.add(linkedCapster.barbershopId);
     }
  }

  if (barbershopIds.size > 0) {
      capsters = await prisma.capster.findMany({
          where: { barbershopId: { in: Array.from(barbershopIds) } },
          include: {
              user: true,
              barbershop: true,
          },
      });
  } else {
    capsters = [];
  }

  return NextResponse.json(capsters);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== "owner" && session.user?.role !== "admin" && session.user?.role !== "co-owner")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password, barbershopId, specialization, role } = await req.json();

  if (!name || !email || !password || !barbershopId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify ownership or admin association
  if (session.user.role === "owner") {
      const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
      if (!barbershop || barbershop.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized or barbershop not found" }, { status: 403 });
      }
  } else if (session.user.role === "admin" || session.user.role === "co-owner") {
      const adminCapster = await prisma.capster.findUnique({ where: { userId: session.user.id } });
      if (!adminCapster || adminCapster.barbershopId !== barbershopId) {
          return NextResponse.json({ error: "Unauthorized: You can only add members to your assigned barbershop" }, { status: 403 });
      }
  }

  // Check if user with email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
        // 1. Create the User
        const newUser = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "capster" // Default to capster if not provided
            }
        });

        // 2. Create the Capster entry
        const newCapster = await tx.capster.create({
            data: {
                userId: newUser.id,
                barbershopId,
                specialization
            },
            include: {
                user: true, 
                barbershop: true
            }
        });

        return newCapster;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Error creating capster:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Allow owners and admins to edit? For now, sticking to owner based on existing logic, but maybe update if needed for Admin role.
  // The prompt asked for "edit team member", usually accessible by Owner. 
  if (!session || (session.user?.role !== "owner" && session.user?.role !== "admin" && session.user?.role !== "co-owner")) { 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, specialization, name, email, role } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Check ownership of the capster's barbershop before updating
  // Or if admin, they might be able to edit anyone?
  // Let's stick to the current scope: Owner manages their team.
  const capster = await prisma.capster.findUnique({ 
    where: { id },
    include: { user: true }
  });
  
  if (!capster) {
    return NextResponse.json({ error: "Capster not found" }, { status: 404 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id: capster.barbershopId } });
  
  // Strict check: Only owner of the barbershop can edit? 
  // If session is owner, check id.
  if (session.user.role === "owner" && (!barbershop || barbershop.ownerId !== session.user.id)) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
      const result = await prisma.$transaction(async (tx) => {
          // Update User details
          if (name || email || role) {
              await tx.user.update({
                  where: { id: capster.userId },
                  data: {
                      name: name || undefined,
                      email: email || undefined,
                      role: role || undefined
                  }
              });
          }

          // Update Capster details
          const updatedCapster = await tx.capster.update({
              where: { id },
              data: { specialization },
              include: {
                  user: true,
                  barbershop: true
              }
          });
          
          return updatedCapster;
      });

      return NextResponse.json(result);
  } catch (error) {
      console.error("Error updating capster:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const capster = await prisma.capster.findUnique({ where: { id } });

  if (!capster) {
    return NextResponse.json({ error: "Capster not found" }, { status: 404 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id: capster.barbershopId } });

  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.capster.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted successfully" });
}
