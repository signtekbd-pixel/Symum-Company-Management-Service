import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const branches = await prisma.branch.findMany({
      where,
      include: {
        _count: { select: { users: true, orders: true, machines: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, address, phone, email } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const existing = await prisma.branch.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Branch with this code already exists" }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: { name, code, address, phone, email },
      include: { _count: { select: { users: true, orders: true, machines: true } } },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
