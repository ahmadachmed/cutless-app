import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth-utils";
import { getBarbershopsForOwner, createBarbershop, updateBarbershop, deleteBarbershop } from "@/app/lib/dal";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    requireRole(session, ["owner"]);
    const barbershops = await getBarbershopsForOwner(session?.user?.id as string);
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
    
    // Call DAL
    const result = await createBarbershop(body, session?.user?.id as string);

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.code || 500 });
    }

    return NextResponse.json(result.barbershop, { status: 201 });
  } catch (error: unknown) {
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
    const body = await req.json();

    // Call DAL
    const result = await updateBarbershop(body, session?.user?.id as string);

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.code || 500 });
    }

    return NextResponse.json(result.barbershop);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update barbershop" },
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

    // Call DAL
    const result = await deleteBarbershop(id, session?.user?.id as string);

    if (result.error) {
       return NextResponse.json({ error: result.error }, { status: result.code || 500 });
    }
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete barbershop" },
      { status: 500 }
    );
  }
}
