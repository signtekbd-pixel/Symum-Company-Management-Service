import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");

    const where: any = {};

    if (search) {
      where.OR = [
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const proofs = await prisma.proof.findMany({
      where,
      include: {
        order: true,
        customer: true,
        annotations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ proofs });
  } catch (error) {
    console.error("Error fetching proofs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerId, orderItemId, fileUrl, notes } = body;

    if (!orderId || !customerId || !fileUrl) {
      return NextResponse.json(
        { error: "Order, customer, and file are required" },
        { status: 400 }
      );
    }

    // Get the latest version number for this order
    const latestProof = await prisma.proof.findFirst({
      where: { orderId },
      orderBy: { version: "desc" },
    });

    const proof = await prisma.proof.create({
      data: {
        orderId,
        customerId,
        orderItemId,
        version: (latestProof?.version || 0) + 1,
        fileUrl,
        notes,
      },
      include: {
        order: true,
        customer: true,
      },
    });

    return NextResponse.json(proof, { status: 201 });
  } catch (error) {
    console.error("Error creating proof:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
