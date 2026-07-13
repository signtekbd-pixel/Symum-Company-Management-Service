import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const where: any = {};
    if (status) where.status = status;
    if (orderId) where.orderId = orderId;

    const jobs = await prisma.productionJob.findMany({
      where,
      include: { order: { include: { customer: true } }, machine: true, operator: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { orderId, orderItemId, machineId, operatorId, estimatedHours, notes } = body;
    if (!orderId) return NextResponse.json({ error: "Order is required" }, { status: 400 });

    const job = await prisma.productionJob.create({
      data: { orderId, orderItemId, machineId, operatorId, estimatedHours, notes },
      include: { order: true, machine: true, operator: true },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
