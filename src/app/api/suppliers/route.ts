import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const where: any = {};
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { contactPerson: { contains: search, mode: "insensitive" } },
    ];

    const suppliers = await prisma.supplier.findMany({
      where, include: { _count: { select: { supplierMaterials: true } } }, orderBy: { name: "asc" },
    });
    return NextResponse.json({ suppliers });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, contactPerson, phone, email, address } = body;
    if (!name || !phone) return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });

    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address },
      include: { _count: { select: { supplierMaterials: true } } },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
