import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: true,
          branch: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const {
      customerId,
      branchId,
      priority,
      notes,
      specialInstructions,
      dueDate,
      deliveryAddress,
      deliveryMethod,
      items,
    } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and at least one item are required" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += itemTotal;
      return {
        productId: item.productId,
        priceTemplateId: item.priceTemplateId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        totalPrice: itemTotal,
        specifications: item.specifications,
        fileUrl: item.fileUrl,
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId,
        branchId,
        priority: priority || "NORMAL",
        notes,
        specialInstructions,
        dueDate: dueDate ? new Date(dueDate) : null,
        deliveryAddress,
        deliveryMethod,
        subtotal,
        totalAmount: subtotal,
        createdBy: session.user.id,
        items: {
          create: orderItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
