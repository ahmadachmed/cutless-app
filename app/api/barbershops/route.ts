import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust as necessary

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optionally show only barbershops owned by the user if owner
  let barbershops;

  if (session.user?.role === "owner") {
    barbershops = await prisma.barbershop.findMany({
      where: { ownerId: session.user.id },
      include: { owner: true },
    });
  } else {
    // For other roles, you can decide what to show or return empty list
    barbershops = [];
  }

  return NextResponse.json(barbershops);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, subscriptionPlan } = await req.json();

  if (!name || !subscriptionPlan) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const barbershop = await prisma.barbershop.create({
    data: {
      name,
      ownerId: session.user.id,
      subscriptionPlan,
    },
  });

  return NextResponse.json(barbershop, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, subscriptionPlan } = await req.json();

  if (!id || !name || !subscriptionPlan) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id } });

  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const updatedBarbershop = await prisma.barbershop.update({
    where: { id },
    data: { name, subscriptionPlan },
  });

  return NextResponse.json(updatedBarbershop);
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

  const barbershop = await prisma.barbershop.findUnique({ where: { id } });

  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  await prisma.barbershop.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted successfully" });
}
