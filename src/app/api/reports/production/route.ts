import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "week": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "quarter": startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); break;
      case "year": startDate = new Date(now.getFullYear(), 0, 1); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [totalJobs, jobsByStatus, completedJobs, avgProgress, jobsByMachine, recentJobs] = await Promise.all([
      prisma.productionJob.count({ where: { createdAt: { gte: startDate } } }),
      prisma.$queryRaw`SELECT "status", COUNT(*)::int AS count FROM "ProductionJob" WHERE "createdAt" >= ${startDate} GROUP BY "status" ORDER BY count DESC`,
      prisma.productionJob.count({ where: { status: "COMPLETED", completedAt: { gte: startDate } } }),
      prisma.productionJob.aggregate({ where: { createdAt: { gte: startDate } }, _avg: { progress: true } }),
      prisma.$queryRaw`SELECT COALESCE(m.name, 'Unassigned') AS name, COUNT(pj.id)::int AS "jobCount", AVG(pj.progress)::float AS "avgProgress" FROM "ProductionJob" pj LEFT JOIN "Machine" m ON pj."machineId" = m.id WHERE pj."createdAt" >= ${startDate} GROUP BY m.name ORDER BY "jobCount" DESC`,
      prisma.productionJob.findMany({ where: { createdAt: { gte: startDate } }, include: { order: { include: { customer: true } }, machine: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    return NextResponse.json({ totalJobs, jobsByStatus, completedJobs, avgProgress: Math.round(avgProgress._avg.progress || 0), jobsByMachine, recentJobs });
  } catch (error) {
    return apiError(error);
  }
}
