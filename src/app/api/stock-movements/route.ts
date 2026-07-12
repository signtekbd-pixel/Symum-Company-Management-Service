import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { materialId, warehouseId, type, quantity, referenceType, referenceId, notes, performedBy } = body;

    if (!materialId || !type || !quantity) {
      return NextResponse.json(
        { error: "Material, type, and quantity are required" },
        { status: 400 }
      );
    }

    const movement = await prisma.stockMovement.create({
      data: {
        materialId,
        warehouseId,
        type,
        quantity,
        referenceType,
        referenceId,
        notes,
        performedBy: performedBy || "system",
      },
      include: {
        material: true,
        warehouse: true,
      },
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get("materialId");
    const type = searchParams.get("type");

    const where: any = {};
    if (materialId) where.materialId = materialId;
    if (type) where.type = type;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        material: true,
        warehouse: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ movements });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
