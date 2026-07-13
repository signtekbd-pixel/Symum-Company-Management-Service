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
    const proof = await prisma.proof.findUnique({
      where: { id }, include: { order: true, customer: true, annotations: true, reviews: true },
    });
    if (!proof) return NextResponse.json({ error: "Proof not found" }, { status: 404 });
    return NextResponse.json(proof);
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
    const { status, notes, reviewedBy } = body;

    const proof = await prisma.proof.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }), ...(notes !== undefined && { notes }),
        ...(reviewedBy !== undefined && { reviewedBy }),
        ...(status === "APPROVED" || status === "REJECTED" || status === "REVISION_NEEDED" ? { reviewedAt: new Date() } : {}),
      },
      include: { order: true, customer: true, annotations: true },
    });
    return NextResponse.json(proof);
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
    await prisma.proof.delete({ where: { id } });
    return NextResponse.json({ message: "Proof deleted" });
  } catch (error) {
    return apiError(error);
  }
}
