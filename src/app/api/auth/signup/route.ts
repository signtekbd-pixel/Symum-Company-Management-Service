import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (rateLimit(request, "signup", 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, company, type } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const roleRecord = await prisma.role.findUnique({
      where: { name: "CUSTOMER" },
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: "System configuration error" },
        { status: 500 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        roleId: roleRecord.id,
      },
      select: { id: true, name: true, email: true },
    });

    await prisma.customer.create({
      data: {
        name,
        email: email,
        phone: phone || "",
        company: company || null,
        type: type || "INDIVIDUAL",
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
