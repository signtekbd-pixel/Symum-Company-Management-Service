import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.productionJob.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            items: true,
          },
        },
        machine: true,
        operator: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Production job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching production job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, progress, machineId, operatorId, estimatedHours, actualHours, notes } = body;

    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === "IN_PROGRESS" || status === "QUEUED") {
        updateData.startedAt = updateData.startedAt || new Date();
      }
      if (status === "COMPLETED" || status === "FAILED") {
        updateData.completedAt = new Date();
      }
    }

    if (progress !== undefined) updateData.progress = progress;
    if (machineId !== undefined) updateData.machineId = machineId;
    if (operatorId !== undefined) updateData.operatorId = operatorId;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (notes !== undefined) updateData.notes = notes;

    const job = await prisma.productionJob.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        machine: true,
        operator: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating production job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.productionJob.delete({ where: { id } });
    return NextResponse.json({ message: "Production job deleted" });
  } catch (error) {
    console.error("Error deleting production job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
