import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Public endpoint for customers to list barbershops
  // Optionally support search params
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const barbershops = await prisma.barbershop.findMany({
      where: {
        name: { contains: search }
      },
      select: {
      id: true,
      name: true,
      address: true,
      services: true,
      teams: {
        include: {
          user: { select: { name: true } }
        }
      }
      }
    });
    return NextResponse.json(barbershops);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch barbershops" }, { status: 500 });
  }
}
