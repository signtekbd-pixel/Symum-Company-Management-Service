import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalOrders,
      activeCustomers,
      inProduction,
      monthlyRevenueResult,
      recentOrders,
      productionJobs,
    ] = await Promise.all([
      prisma.order.count({
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.customer.count({
        where: { isActive: true },
      }),
      prisma.productionJob.count({
        where: { status: { in: ["QUEUED", "IN_PROGRESS"] } },
      }),
      prisma.order.aggregate({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.productionJob.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          order: true,
          machine: true,
        },
        where: { status: { in: ["QUEUED", "IN_PROGRESS"] } },
      }),
    ]);

    return NextResponse.json({
      totalOrders,
      activeCustomers,
      inProduction,
      monthlyRevenue: Number(monthlyRevenueResult._sum.totalAmount || 0),
      recentOrders,
      productionJobs,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({
      totalOrders: 0,
      activeCustomers: 0,
      inProduction: 0,
      monthlyRevenue: 0,
      recentOrders: [],
      productionJobs: [],
    });
  }
}
