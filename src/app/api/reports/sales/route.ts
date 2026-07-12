import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [
      totalRevenueResult,
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenueByMonth,
      topProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      prisma.order.count({
        where: {
          status: "DELIVERED",
          createdAt: { gte: startDate },
        },
      }),
      prisma.order.count({
        where: {
          status: "CANCELLED",
          createdAt: { gte: startDate },
        },
      }),
      prisma.$queryRaw`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          SUM("totalAmount")::float AS revenue,
          COUNT(*)::int AS "orderCount"
        FROM "Order"
        WHERE "createdAt" >= ${startDate}
          AND "status" != 'CANCELLED'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      `,
      prisma.$queryRaw`
        SELECT
          p.name,
          COUNT(oi.id)::int AS "orderCount",
          SUM(oi."totalPrice")::float AS revenue
        FROM "OrderItem" oi
        JOIN "Product" p ON oi."productId" = p.id
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."createdAt" >= ${startDate}
          AND o."status" != 'CANCELLED'
        GROUP BY p.name
        ORDER BY revenue DESC
        LIMIT 5
      `,
    ]);

    return NextResponse.json({
      totalRevenue: Number(totalRevenueResult._sum.totalAmount || 0),
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenueByMonth,
      topProducts,
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      revenueByMonth: [],
      topProducts: [],
    });
  }
}
