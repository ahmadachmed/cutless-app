import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!["CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { barbershop: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Authorization
    let isAuthorized = false;

    const role = session.user.role || "";

    if (role === "owner") {
      // Check if owner owns the barbershop
      if (appointment.barbershop.ownerId === session.user.id) {
        isAuthorized = true;
      }
    } else if (["capster", "admin", "co-owner"].includes(role)) {
      // Check if user belongs to the barbershop via Team table
      const team = await prisma.team.findUnique({
        where: { userId: session.user.id },
      });
      if (team && team.barbershopId === appointment.barbershopId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
