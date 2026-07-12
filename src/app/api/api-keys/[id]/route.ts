import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
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
    const { isActive } = body;

    const key = await prisma.apiKey.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, keyPrefix: true, isActive: true },
    });

    return NextResponse.json(key);
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
