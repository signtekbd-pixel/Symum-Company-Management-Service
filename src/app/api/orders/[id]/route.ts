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
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        branch: true,
        proofs: true,
        productionJobs: true,
        invoices: true,
        orderHistory: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status, priority, notes, dueDate } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      await prisma.orderHistory.create({
        data: {
          orderId: id,
          status,
          notes: `Status changed to ${status}`,
          changedBy: session.user.id,
        },
      });
      if (status === "CONFIRMED") updateData.confirmedAt = new Date();
      if (status === "IN_PRODUCTION") updateData.productionStartedAt = new Date();
      if (status === "DELIVERED") updateData.deliveredAt = new Date();
      if (status === "READY" || status === "QUALITY_CHECK") updateData.completedAt = new Date();
    }

    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (dueDate) updateData.dueDate = new Date(dueDate);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { customer: true, items: true },
    });

    return NextResponse.json(updatedOrder);
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
    const order = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(order);
  } catch (error) {
    return apiError(error);
  }
}
