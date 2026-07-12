import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$connect();
    const roleCount = await prisma.role.count();
    const userCount = await prisma.user.count();
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    return NextResponse.json({
      connected: true,
      roleCount,
      userCount,
      tables: (tables as any[]).map((t) => t.table_name),
    });
  } catch (e: any) {
    return NextResponse.json({ connected: false, error: e.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
