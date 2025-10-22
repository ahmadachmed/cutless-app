import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BarbershopFormSchema } from "@/app/lib/definitions";

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


  try {
    const body = await req.json();
    const validation = BarbershopFormSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json({ errors: formattedErrors }, { status: 400 });
    }
    const { name, address, phoneNumber, subscriptionPlan } = validation.data;

    const existingBarbershop = await prisma.barbershop.findUnique({ where: { name } });
    if (existingBarbershop) {
      return NextResponse.json(
        { error: "Barbershop name must be unique" },
        { status: 409 }
      );
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

  const validation = BarbershopFormSchema.safeParse(await req.json());
  if (!validation.success) {
    const formattedErrors = validation.error.flatten().fieldErrors;
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  const { id, name, address, phoneNumber, subscriptionPlan } = validation.data as any;
  
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  } else {
    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop || barbershop.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Barbershop id is not found" }, { status: 404 });
    }
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
      return NextResponse.json({ code: error.code, error: "Barbershop name must be unique" }, { status: 409 });
    }
    return NextResponse.json({ code: error.code, error: "Failed to update barbershop" }, { status: 500 });
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

  try {
    await prisma.$transaction(async (prisma) => {
      // Hapus relasi capsters terlebih dahulu
      await prisma.capster.deleteMany({ where: { barbershopId: id } });
      // Hapus barbershop
      await prisma.barbershop.delete({ where: { id } });
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete barbershop" }, { status: 500 });
  }
  return NextResponse.json({ message: "Barbershop deleted successfully" });
}
