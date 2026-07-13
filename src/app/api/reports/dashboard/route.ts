import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireAuth();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [totalOrders, activeCustomers, inProduction, monthlyRevenueResult, recentOrders, productionJobs, totalUsers, totalProducts, totalMaterials, totalBranches, totalMachines, activeMachines, lowStockMaterials] = await Promise.all([
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.productionJob.count({ where: { status: { in: ["QUEUED", "IN_PROGRESS"] } } }),
      prisma.order.aggregate({ where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth, lte: endOfMonth } }, _sum: { totalAmount: true } }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { customer: true } }),
      prisma.productionJob.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { order: true, machine: true }, where: { status: { in: ["QUEUED", "IN_PROGRESS"] } } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.material.count({ where: { isActive: true } }),
      prisma.branch.count({ where: { isActive: true } }),
      prisma.machine.count(),
      prisma.machine.count({ where: { status: "AVAILABLE" } }),
      prisma.material.findMany({ where: { isActive: true }, select: { id: true, name: true, code: true, minStockLevel: true, reorderPoint: true } }).then((m) => m.filter((x) => x.minStockLevel > 0 && x.minStockLevel <= x.reorderPoint).length),
    ]);

    return NextResponse.json({ totalOrders, activeCustomers, inProduction, monthlyRevenue: Number(monthlyRevenueResult._sum.totalAmount || 0), recentOrders, productionJobs, totalUsers, totalProducts, totalMaterials, totalBranches, totalMachines, activeMachines, lowStockMaterials });
  } catch (error) {
    return apiError(error);
  }
}
