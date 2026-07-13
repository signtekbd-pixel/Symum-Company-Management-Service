import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { invoiceId, amount, method, reference, notes } = body;

    if (!invoiceId || !amount || !method) {
      return NextResponse.json({ error: "Invoice, amount, and method are required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (Number(invoice.dueAmount) <= 0) return NextResponse.json({ error: "Invoice is already fully paid" }, { status: 400 });

    const payment = await prisma.payment.create({
      data: {
        paymentNumber: `PAY-${Date.now()}`, invoiceId, amount, method, reference, notes,
        receivedBy: session.user.id,
      },
    });

    const newPaidAmount = Number(invoice.paidAmount) + amount;
    const newDueAmount = Math.max(0, Number(invoice.totalAmount) - newPaidAmount);
    let newStatus: "PARTIAL" | "PAID" = "PARTIAL";
    if (newDueAmount <= 0) newStatus = "PAID";

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, dueAmount: newDueAmount, status: newStatus },
    });

    if (invoice.customerId) {
      await prisma.customer.update({ where: { id: invoice.customerId }, data: { currentBalance: { decrement: amount } } });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");
    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId;

    const payments = await prisma.payment.findMany({ where, include: { invoice: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ payments });
  } catch (error) {
    return apiError(error);
  }
}
