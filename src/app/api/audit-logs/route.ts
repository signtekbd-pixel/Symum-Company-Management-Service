import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, apiError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";
    const entity = searchParams.get("entity") || "";
    const action = searchParams.get("action") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, limit });
  } catch (error) {
    return apiError(error);
  }
}
