import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const where: any = {};
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
    if (status) where.status = status;

    const machines = await prisma.machine.findMany({
      where, include: { branch: true, _count: { select: { jobs: true } } }, orderBy: { name: "asc" },
    });
    return NextResponse.json({ machines });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, code, type, branchId } = body;
    if (!name || !code || !type) return NextResponse.json({ error: "Name, code, and type are required" }, { status: 400 });

    const existing = await prisma.machine.findUnique({ where: { code } });
    if (existing) return NextResponse.json({ error: "Machine with this code already exists" }, { status: 400 });

    const machine = await prisma.machine.create({
      data: { name, code, type, branchId: branchId || null }, include: { branch: true },
    });
    return NextResponse.json(machine, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
