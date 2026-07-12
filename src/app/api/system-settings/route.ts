import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body; // Array of { key, value, description? }

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Settings must be an array" }, { status: 400 });
    }

    const updates = await Promise.all(
      settings.map((s: { key: string; value: string; description?: string }) =>
        prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, ...(s.description !== undefined && { description: s.description }) },
          create: { key: s.key, value: s.value, description: s.description },
        })
      )
    );

    return NextResponse.json({ settings: updates });
  } catch (error) {
    console.error("Error updating system settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
