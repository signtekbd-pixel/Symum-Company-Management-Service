import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { materialId, warehouseId, type, quantity, referenceType, referenceId, notes } = body;

    if (!materialId || !type || !quantity) {
      return NextResponse.json({ error: "Material, type, and quantity are required" }, { status: 400 });
    }

    const movement = await prisma.stockMovement.create({
      data: {
        materialId, warehouseId, type, quantity, referenceType, referenceId, notes,
        performedBy: session.user.id,
      },
      include: { material: true, warehouse: true },
    });
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get("materialId");
    const type = searchParams.get("type");
    const where: any = {};
    if (materialId) where.materialId = materialId;
    if (type) where.type = type;

    const movements = await prisma.stockMovement.findMany({
      where, include: { material: true, warehouse: true }, orderBy: { createdAt: "desc" }, take: 100,
    });
    return NextResponse.json({ movements });
  } catch (error) {
    return apiError(error);
  }
}
