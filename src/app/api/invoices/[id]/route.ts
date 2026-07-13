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
    const invoice = await prisma.invoice.findUnique({
      where: { id }, include: { customer: true, order: true, payments: { orderBy: { createdAt: "desc" } } },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(invoice);
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
    const { status, dueDate, notes } = body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes }),
      },
      include: { customer: true, order: true },
    });
    return NextResponse.json(invoice);
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
    await prisma.invoice.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ message: "Invoice cancelled" });
  } catch (error) {
    return apiError(error);
  }
}
