import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let whereClause = {};

    if (session.user.role === "customer") {
      whereClause = { customerId: session.user.id };
    } else if (session.user.role === "owner") {
      // Fetch appointments for all barbershops owned by the user
      const barbershops = await prisma.barbershop.findMany({
        where: { ownerId: session.user.id },
        select: { id: true },
      });
      const barbershopIds = barbershops.map((b) => b.id);
      whereClause = { barbershopId: { in: barbershopIds } };
    } else if (session.user.role === "capster") {
      const team = await prisma.team.findUnique({
        where: { userId: session.user.id }
      });
      if(team) {
         whereClause = { teamId: team.id };
      } else {
        return NextResponse.json([]);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: true,
        barbershop: true,
        team: {
          include: {
            user: { select: { name: true } }
          }
        },
        customer: { select: { name: true, email: true } }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized. Only customers can book." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { barbershopId, teamId, serviceId, date } = body;

    if (!barbershopId || !teamId || !serviceId || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    
    // Basic validation: Check if team member/service belongs to barbershop
    const service = await prisma.service.findFirst({
        where: { id: serviceId, barbershopId }
    });
    if (!service) return NextResponse.json({ error: "Invalid service for this barbershop" }, { status: 400 });

    const team = await prisma.team.findFirst({
        where: { id: teamId, barbershopId }
    });
    if (!team) return NextResponse.json({ error: "Invalid team member for this barbershop" }, { status: 400 });


    const appointment = await prisma.appointment.create({
      data: {
        customerId: session.user.id,
        barbershopId,
        teamId,
        serviceId,
        date: new Date(date),
        status: "PENDING"
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
