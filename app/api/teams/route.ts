import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let teams: unknown[] = [];
  const barbershopIds = new Set<string>();

  if (session.user?.role === "owner") {
    const ownedBarbershops = await prisma.barbershop.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    ownedBarbershops.forEach(b => barbershopIds.add(b.id));
  }

  if (session.user?.role === "owner" || session.user?.role === "admin" || session.user?.role === "capster" || session.user?.role === "co-owner") {
     const linkedTeam = await prisma.team.findUnique({
         where: { userId: session.user.id },
         select: { barbershopId: true }
     });

     if (linkedTeam) {
         barbershopIds.add(linkedTeam.barbershopId);
     }
  }

  if (barbershopIds.size > 0) {
      teams = await prisma.team.findMany({
          where: { barbershopId: { in: Array.from(barbershopIds) } },
          include: {
              user: true,
              barbershop: true,
          },
      });
  } else {
    teams = [];
  }

  return NextResponse.json(teams);
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

  if (session.user.role === "owner") {
      const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
      if (!barbershop || barbershop.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized or barbershop not found" }, { status: 403 });
      }
  } else if (session.user.role === "admin" || session.user.role === "co-owner") {
      const adminTeam = await prisma.team.findUnique({ where: { userId: session.user.id } });
      if (!adminTeam || adminTeam.barbershopId !== barbershopId) {
          return NextResponse.json({ error: "Unauthorized: You can only add members to your assigned barbershop" }, { status: 403 });
      }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "capster"
            }
        });

        const newTeam = await tx.team.create({
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

        return newTeam;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== "owner" && session.user?.role !== "admin" && session.user?.role !== "co-owner")) { 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, specialization, name, email, role } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ 
    where: { id },
    include: { user: true }
  });
  
  if (!team) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id: team.barbershopId } });
  
  if (session.user.role === "owner" && (!barbershop || barbershop.ownerId !== session.user.id)) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
      const result = await prisma.$transaction(async (tx) => {
          if (name || email || role) {
              await tx.user.update({
                  where: { id: team.userId },
                  data: {
                      name: name || undefined,
                      email: email || undefined,
                      role: role || undefined
                  }
              });
          }

          const updatedTeam = await tx.team.update({
              where: { id },
              data: { specialization },
              include: {
                  user: true,
                  barbershop: true
              }
          });
          
          return updatedTeam;
      });

      return NextResponse.json(result);
  } catch (error) {
      console.error("Error updating team member:", error);
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

  const team = await prisma.team.findUnique({ where: { id } });

  if (!team) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id: team.barbershopId } });

  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.team.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted successfully" });
}
