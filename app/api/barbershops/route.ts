import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { BarbershopFormSchema } from "@/app/lib/definitions";
import { requireRole, requireSession } from "@/app/lib/auth-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    requireRole(session, ["owner"]);
    const barbershops = await prisma.barbershop.findMany({
      where: { ownerId: session?.user?.id },
      include: { capsters: true, owner: true },
    });
    return NextResponse.json(barbershops);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Unauthorized" },
      { status: (err as Error).message === "Forbidden" ? 403 : 401 }
    );
  }
}

export async function POST(req: NextRequest) {
 const session = await getServerSession(authOptions);
  try {
    requireRole(session, ["owner"]);
    const body = await req.json();
    const validation = BarbershopFormSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json({ errors: formattedErrors }, { status: 400 });
    }
    const { name, address, phoneNumber, subscriptionPlan } = validation.data;
    const existingBarbershop = await prisma.barbershop.findUnique({
      where: { name },
    });
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
        ownerId: session?.user?.id as string,
      },
    });
    return NextResponse.json(barbershop, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Barbershop name must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create barbershop" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
 const session = await getServerSession(authOptions);
  try {
    requireRole(session, ["owner"]);
    const validation = BarbershopFormSchema.safeParse(await req.json());
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json({ errors: formattedErrors }, { status: 400 });
    }
    const { id, name, address, phoneNumber, subscriptionPlan } = validation.data as any;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop || barbershop.ownerId !== session?.user?.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 403 }
      );
    }
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
    if (error.code === "P2002") {
      return NextResponse.json(
        { code: error.code, error: "Barbershop name must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { code: error.code, error: "Failed to update barbershop" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    requireRole(session, ["owner"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop || barbershop.ownerId !== session?.user?.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 403 }
      );
    }
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.capster.deleteMany({ where: { barbershopId: id } });
      await prismaTx.barbershop.delete({ where: { id } });
    });
    return NextResponse.json({ message: "Barbershop deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete barbershop" },
      { status: 500 }
    );
  }
}
