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
    const category = await prisma.materialCategory.findUnique({
      where: { id }, include: { _count: { select: { materials: true } } },
    });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
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
    const { name, description } = body;

    const existing = await prisma.materialCategory.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    if (name && name !== existing.name) {
      const duplicate = await prisma.materialCategory.findUnique({ where: { name } });
      if (duplicate) return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    const category = await prisma.materialCategory.update({
      where: { id },
      data: { ...(name !== undefined && { name }), ...(description !== undefined && { description }) },
      include: { _count: { select: { materials: true } } },
    });
    return NextResponse.json(category);
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
    const category = await prisma.materialCategory.findUnique({
      where: { id }, include: { _count: { select: { materials: true } } },
    });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    if (category._count.materials > 0) {
      return NextResponse.json({ error: `Cannot delete — ${category._count.materials} material(s) still use it.` }, { status: 400 });
    }
    await prisma.materialCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
