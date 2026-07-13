import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, include: { customer: true, order: true }, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.invoice.count({ where }),
    ]);
    return NextResponse.json({ invoices, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { orderId, customerId, subtotal, tax, discount, totalAmount, dueDate, notes } = body;
    if (!customerId || !totalAmount) return NextResponse.json({ error: "Customer and total amount are required" }, { status: 400 });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`, orderId, customerId,
        subtotal: subtotal || 0, tax: tax || 0, discount: discount || 0,
        totalAmount, dueAmount: totalAmount, dueDate: dueDate ? new Date(dueDate) : null, notes,
      },
      include: { customer: true, order: true },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
