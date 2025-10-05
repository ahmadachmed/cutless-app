import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Jika owner, hanya ambil barbershop miliknya
  if (session.user?.role === "owner") {
    const barbershops = await prisma.barbershop.findMany({
      where: { ownerId: session.user.id },
      include: { capsters: true, owner: true },
    });
    return NextResponse.json(barbershops);
  } 

  // Untuk role lain, bisa sesuaikan kebijakan, misal semua barbershop atau kosong
  return NextResponse.json([], { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, address, phoneNumber, subscriptionPlan } = await req.json();

  if (!name || !address || !phoneNumber || !subscriptionPlan) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    if (!session.user.id) {
      return NextResponse.json({ error: "Owner ID is missing" }, { status: 400 });
    }
    const barbershop = await prisma.barbershop.create({
      data: {
        name,
        address,
        phoneNumber,
        subscriptionPlan,
        ownerId: session.user.id as string,
      },
    });
    return NextResponse.json(barbershop, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint failed
      return NextResponse.json({ error: "Barbershop name must be unique" }, { status: 409 });
    }
    console.error("Error creating barbershop:",error);
    return NextResponse.json({ error: "Failed to create barbershop" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, address, phoneNumber, subscriptionPlan } = await req.json();

  if (!id || !name || !address || !phoneNumber || !subscriptionPlan) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { id } });

  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  try {
    const updatedBarbershop = await prisma.barbershop.update({
      where: { id },
      data: {
        name,
        address,
        phoneNumber,
        subscriptionPlan,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedBarbershop);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Barbershop name must be unique" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update barbershop" }, { status: 500 });
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

  const barbershop = await prisma.barbershop.findUnique({ where: { id } });

  if (!barbershop || barbershop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  await prisma.barbershop.delete({ where: { id } });

  return NextResponse.json({ message: "Barbershop deleted successfully" });
}
