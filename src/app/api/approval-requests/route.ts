import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, apiError } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireSuperAdmin();
    const requests = await prisma.approvalRequest.findMany({
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin();
    const body = await request.json();
    const { type, description, targetId } = body;

    if (!type || !description) {
      return NextResponse.json({ error: "type and description are required" }, { status: 400 });
    }

    const approval = await prisma.approvalRequest.create({
      data: {
        type,
        description,
        targetId: targetId || null,
        requesterId: session.user.id,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
