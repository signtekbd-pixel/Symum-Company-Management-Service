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
    const material = await prisma.material.findUnique({
      where: { id },
      include: { category: true, branch: true, stockMovements: { orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!material) return NextResponse.json({ error: "Material not found" }, { status: 404 });
    return NextResponse.json(material);
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
    const { name, code, categoryId, unit, description, minStockLevel, maxStockLevel, reorderPoint, costPrice, branchId, isActive } = body;

    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }), ...(code !== undefined && { code }),
        ...(categoryId !== undefined && { categoryId }), ...(unit !== undefined && { unit }),
        ...(description !== undefined && { description }), ...(minStockLevel !== undefined && { minStockLevel }),
        ...(maxStockLevel !== undefined && { maxStockLevel }), ...(reorderPoint !== undefined && { reorderPoint }),
        ...(costPrice !== undefined && { costPrice }), ...(branchId !== undefined && { branchId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { category: true },
    });
    return NextResponse.json(material);
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
    await prisma.material.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return apiError(error);
  }
}
