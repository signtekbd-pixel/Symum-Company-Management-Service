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
      totalOrders,
      ordersByStatus,
      ordersByPriority,
      avgOrderValue,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.$queryRaw`
        SELECT "status", COUNT(*)::int AS count
        FROM "Order"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "status"
        ORDER BY count DESC
      `,
      prisma.$queryRaw`
        SELECT "priority", COUNT(*)::int AS count
        FROM "Order"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "priority"
        ORDER BY count DESC
      `,
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
        _avg: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      totalOrders,
      ordersByStatus,
      ordersByPriority,
      avgOrderValue: Number(avgOrderValue._avg.totalAmount || 0),
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching order report:", error);
    return NextResponse.json({
      totalOrders: 0,
      ordersByStatus: [],
      ordersByPriority: [],
      avgOrderValue: 0,
      recentOrders: [],
    });
  }
}
