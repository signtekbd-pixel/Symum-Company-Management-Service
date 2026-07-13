import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: { _count: { select: { users: true, orders: true, machines: true } } },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, code, address, phone, email, isActive } = body;

    const existing = await prisma.branch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    if (code && code !== existing.code) {
      const duplicate = await prisma.branch.findUnique({ where: { code } });
      if (duplicate) {
        return NextResponse.json({ error: "Branch code already in use" }, { status: 400 });
      }
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { _count: { select: { users: true, orders: true, machines: true } } },
    });

    return NextResponse.json(branch);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    await prisma.branch.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
