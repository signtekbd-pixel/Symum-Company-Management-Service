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
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { supplierMaterials: { include: { material: true } }, _count: { select: { supplierMaterials: true } } },
    });
    if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    return NextResponse.json(supplier);
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
    const { name, contactPerson, phone, email, address, isActive } = body;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }), ...(contactPerson !== undefined && { contactPerson }),
        ...(phone !== undefined && { phone }), ...(email !== undefined && { email }),
        ...(address !== undefined && { address }), ...(isActive !== undefined && { isActive }),
      },
      include: { _count: { select: { supplierMaterials: true } } },
    });
    return NextResponse.json(supplier);
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
    await prisma.supplier.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
