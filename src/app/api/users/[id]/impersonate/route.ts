import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    if (!currentUser || (currentUser.role.name !== "DEV" && currentUser.role.name !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Only DEV users can impersonate" }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (!targetUser.isActive) {
      return NextResponse.json({ error: "Cannot impersonate inactive user" }, { status: 400 });
    }

    // Create audit log for impersonation
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "impersonate",
        entity: "user",
        entityId: targetUser.id,
        oldValues: { impersonatorEmail: currentUser.email },
        newValues: { targetEmail: targetUser.email, targetName: targetUser.name },
      },
    });

    return NextResponse.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role.name,
      },
    });
  } catch (error) {
    console.error("Error impersonating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
