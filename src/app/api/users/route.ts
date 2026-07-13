import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin, apiError } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { name, email, password, phone, role = "SALES" } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get or create role
    let roleRecord = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: { name: role },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        roleId: roleRecord.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET() {
  try {
    const session = await requireAdmin();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return apiError(error);
  }
}
