import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, apiError } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireSuperAdmin();
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: "settings array is required" }, { status: 400 });
    }

    await Promise.all(
      settings.map((s: { key: string; value: string }) =>
        prisma.systemSetting.update({
          where: { key: s.key },
          data: { value: s.value },
        })
      )
    );

    const updated = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ settings: updated });
  } catch (error) {
    return apiError(error);
  }
}
