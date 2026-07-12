import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    // Test DB connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e: any) {
      return NextResponse.json({ error: "Database connection failed", detail: e.message }, { status: 500 });
    }

    // Test user lookup
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", email }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "User is inactive" }, { status: 403 });
    }

    // Test password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role?.name },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Unexpected error", detail: e.message, stack: e.stack }, { status: 500 });
  }
}
