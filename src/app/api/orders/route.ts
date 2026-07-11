import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: Request) {
  try {
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
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Calculate totals
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
        orderNumber: generateOrderNumber(),
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
        createdBy: "system",
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
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
