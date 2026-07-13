import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const where: any = {};
    if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }];

    const categories = await prisma.materialCategory.findMany({
      where, include: { _count: { select: { materials: true } } }, orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, description } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await prisma.materialCategory.findUnique({ where: { name } });
    if (existing) return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });

    const category = await prisma.materialCategory.create({
      data: { name, description }, include: { _count: { select: { materials: true } } },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
