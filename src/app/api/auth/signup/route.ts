import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["DEV", "SUPER_ADMIN", "ADMIN", "MANAGER", "SALES", "OPERATOR", "CUSTOMER"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role = "CUSTOMER", company, type } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
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

    const roleRecord = await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role, description: role },
    });

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

    if (role === "CUSTOMER") {
      await prisma.customer.create({
        data: {
          name,
          email: email,
          phone: phone || "",
          company: company || null,
          type: type || "INDIVIDUAL",
        },
      });
    }

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
