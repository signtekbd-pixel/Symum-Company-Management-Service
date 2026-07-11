import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, categoryId, unit, description, minStockLevel, maxStockLevel, reorderPoint, costPrice, branchId } = body;

    if (!name || !code || !categoryId) {
      return NextResponse.json(
        { error: "Name, code and category are required" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: {
        name,
        code,
        categoryId,
        unit: unit || "sheet",
        description,
        minStockLevel: minStockLevel || 10,
        maxStockLevel: maxStockLevel || 1000,
        reorderPoint: reorderPoint || 50,
        costPrice: costPrice || 0,
        branchId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
