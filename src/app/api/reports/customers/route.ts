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

    const [totalCustomers, newCustomers, topCustomers, customersByType] = await Promise.all([
      prisma.customer.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
      prisma.$queryRaw`SELECT c.name, c."currentBalance"::float AS balance, COUNT(o.id)::int AS "orderCount", COALESCE(SUM(o."totalAmount"), 0)::float AS "totalSpent" FROM "Customer" c LEFT JOIN "Order" o ON c.id = o."customerId" AND o."status" != 'CANCELLED' AND o."createdAt" >= ${startDate} WHERE c."isActive" = true GROUP BY c.name, c."currentBalance" ORDER BY "totalSpent" DESC LIMIT 10`,
      prisma.$queryRaw`SELECT "type", COUNT(*)::int AS count FROM "Customer" WHERE "isActive" = true GROUP BY "type"`,
    ]);

    return NextResponse.json({ totalCustomers, newCustomers, topCustomers, customersByType });
  } catch (error) {
    return apiError(error);
  }
}
