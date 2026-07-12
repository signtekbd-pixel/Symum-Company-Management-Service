import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCustomers,
      totalOrders,
      totalProducts,
      totalMaterials,
      totalBranches,
      totalMachines,
      machinesByStatus,
      recentAuditLogs,
      pendingApprovals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.material.count({ where: { isActive: true } }),
      prisma.branch.count({ where: { isActive: true } }),
      prisma.machine.count(),
      prisma.machine.groupBy({ by: ["status"], _count: true }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.approvalRequest.count({ where: { status: "PENDING" } }),
    ]);

    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    ` as any[];

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCustomers,
      totalOrders,
      totalProducts,
      totalMaterials,
      totalBranches,
      totalMachines,
      machinesByStatus: machinesByStatus.map((m: any) => ({ status: m.status, count: m._count })),
      recentAuditLogs,
      pendingApprovals,
      dbSize: dbSize[0]?.size || "Unknown",
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Error fetching system health:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
