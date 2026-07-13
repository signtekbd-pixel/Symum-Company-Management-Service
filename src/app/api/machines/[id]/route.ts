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
    const machine = await prisma.machine.findUnique({
      where: { id }, include: { branch: true, _count: { select: { jobs: true } } },
    });
    if (!machine) return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    return NextResponse.json(machine);
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
    const { name, code, type, status, branchId } = body;

    const existing = await prisma.machine.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Machine not found" }, { status: 404 });

    if (code && code !== existing.code) {
      const duplicate = await prisma.machine.findUnique({ where: { code } });
      if (duplicate) return NextResponse.json({ error: "Machine code already in use" }, { status: 400 });
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }), ...(code !== undefined && { code }),
        ...(type !== undefined && { type }), ...(status !== undefined && { status }),
        ...(branchId !== undefined && { branchId: branchId || null }),
      },
      include: { branch: true },
    });
    return NextResponse.json(machine);
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
    await prisma.machine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
