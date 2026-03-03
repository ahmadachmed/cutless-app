import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barbershopId = searchParams.get("barbershopId");

  if (!barbershopId) {
    return NextResponse.json({ error: "Barbershop ID required" }, { status: 400 });
  }

  try {
    const services = await prisma.service.findMany({
      where: { barbershopId },
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== "owner" && session.user.role !== "co-owner")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, price, duration, barbershopId } = body;

    if (!name || !price || !duration || !barbershopId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify ownership of the barbershop
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
        return NextResponse.json({ error: "Barbershop not found" }, { status: 404 });
    }

    let isAuthorized = false;
    if (barbershop.ownerId === session.user.id) {
        isAuthorized = true;
    } else if (session.user.role === "co-owner") {
      const team = await prisma.team.findUnique({
        where: { userId: session.user.id }
      });
      if (team && team.barbershopId === barbershopId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access to this barbershop" }, { status: 403 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        barbershopId,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
