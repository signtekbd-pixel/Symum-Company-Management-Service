import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) where.status = status;

    const requests = await prisma.approvalRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requesterId, type, description, targetId } = body;

    if (!requesterId || !type || !description) {
      return NextResponse.json({ error: "requesterId, type, and description are required" }, { status: 400 });
    }

    const approvalRequest = await prisma.approvalRequest.create({
      data: { requesterId, type, description, targetId },
      include: {
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(approvalRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating approval request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
