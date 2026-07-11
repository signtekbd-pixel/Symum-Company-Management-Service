import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        branch: true,
        proofs: true,
        productionJobs: true,
        invoices: true,
        orderHistory: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, notes, dueDate } = body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;

      // Add to order history
      await prisma.orderHistory.create({
        data: {
          orderId: id,
          status,
          notes: `Status changed to ${status}`,
          changedBy: "system",
        },
      });

      // Update timestamps based on status
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
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete - set status to CANCELLED
    const order = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
