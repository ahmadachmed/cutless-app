import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignupFormSchema } from "@/app/lib/definitions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = SignupFormSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json({ errors: formattedErrors }, { status: 400 });
    }

    const { email, password, name, role } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role, // e.g. "customer", "capster", "owner"
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    //   const { email, password, name, role } = await req.json();

    //   if (!email || !password || !name || !role) {
    //     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    //   }

    //   const existingUser = await prisma.user.findUnique({ where: { email } });
    //   if (existingUser) {
    //     return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    //   }

    //   const hashedPassword = await bcrypt.hash(password, 10);

    //   const user = await prisma.user.create({
    //     data: {
    //       email,
    //       password: hashedPassword,
    //       name,
    //       role, // e.g. "customer", "capster", "owner"
    //     },
    //   });

    //   return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    // } catch (error) {
    //   return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
