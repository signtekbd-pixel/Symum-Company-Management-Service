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
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        deliveryAddresses: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
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
    const { name, email, phone, altPhone, company, address, city, type, creditLimit, notes } = body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(altPhone !== undefined && { altPhone }),
        ...(company !== undefined && { company }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(type !== undefined && { type }),
        ...(creditLimit !== undefined && { creditLimit }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(customer);
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
    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Customer deleted" });
  } catch (error) {
    return apiError(error);
  }
}
