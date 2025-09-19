import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api//auth/[...nextauth]/route"; // adjust path as needed

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Allow only owners or capsters to fetch list? Or public? Adjust as needed.
  // This example allows all logged-in users.
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const capsters = await prisma.capster.findMany({
    include: {
      user: true,
      barbershop: true,
    },
  });

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

  if (!id || !specialization) {
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
