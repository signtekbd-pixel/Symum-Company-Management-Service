import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, apiError } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
    }

    const existing = await prisma.approvalRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "Request has already been reviewed" }, { status: 400 });
    }

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: { status, approverId: session.user.id, reviewedAt: new Date() },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error);
  }
}
