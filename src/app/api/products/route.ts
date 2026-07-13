import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = { isActive: true };
    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, categoryId, description, basePrice, unit, minQuantity, leadTimeDays } = body;

    if (!name || !categoryId || !basePrice) {
      return NextResponse.json({ error: "Name, category, and base price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        description,
        basePrice,
        unit: unit || "piece",
        minQuantity: minQuantity || 1,
        leadTimeDays: leadTimeDays || 1,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
