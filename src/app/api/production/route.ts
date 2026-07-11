import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const jobs = await prisma.productionJob.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        machine: true,
        operator: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching production jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderItemId, machineId, operatorId, estimatedHours, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order is required" },
        { status: 400 }
      );
    }

    const job = await prisma.productionJob.create({
      data: {
        orderId,
        orderItemId,
        machineId,
        operatorId,
        estimatedHours,
        notes,
      },
      include: {
        order: true,
        machine: true,
        operator: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating production job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
