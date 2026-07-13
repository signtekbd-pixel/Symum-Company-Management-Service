import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        priceTemplates: true,
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, categoryId, description, basePrice, unit, minQuantity, leadTimeDays, isActive } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(categoryId !== undefined && { categoryId }),
        ...(description !== undefined && { description }),
        ...(basePrice !== undefined && { basePrice }),
        ...(unit !== undefined && { unit }),
        ...(minQuantity !== undefined && { minQuantity }),
        ...(leadTimeDays !== undefined && { leadTimeDays }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return apiError(error);
  }
}
