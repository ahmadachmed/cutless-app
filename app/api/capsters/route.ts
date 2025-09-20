import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Extend the Session user type to include 'role' and 'id'
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      id?: string;
    };
  }
}

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For owners, show capsters linked to their barbershops
  // Adjust business rule if needed
  let capsters: any[] = [];
  if (session.user?.role === "owner") {
    // Get the barbershops owned by this user
    const barbershops = await prisma.barbershop.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    const barbershopIds = barbershops.map((b) => b.id);
    capsters = await prisma.capster.findMany({
      where: { barbershopId: { in: barbershopIds } },
      include: {
        user: true,
        barbershop: true,
      },
    });
  } else {
    // For other roles, optionally return empty or all capsters if applicable
    capsters = [];
  }

  return NextResponse.json(capsters);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, barbershopId, specialization } = await req.json();

  if (!userId || !barbershopId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify ownership of the barbershop
  const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized or barbershop not found" }, { status: 403 });
  }

  const capster = await prisma.capster.create({
    data: { userId, barbershopId, specialization },
  });

  return NextResponse.json(capster, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, specialization } = await req.json();

  if (!id || specialization === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check ownership of the capster's barbershop before updating
  const capster = await prisma.capster.findUnique({ where: { id } });
  if (!capster) {
    return NextResponse.json({ error: "Capster not found" }, { status: 404 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id: capster.barbershopId } });
  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const updatedCapster = await prisma.capster.update({
    where: { id },
    data: { specialization },
  });

  return NextResponse.json(updatedCapster);
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
