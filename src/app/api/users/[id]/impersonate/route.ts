import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const SESSION_TOKEN_NAME = "authjs.session-token";

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

    // Create a new JWT session for the target user
    const token = await encode({
      secret: process.env.NEXTAUTH_SECRET!,
      salt: SESSION_TOKEN_NAME,
      token: {
        sub: targetUser.id,
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role.name,
      },
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({
      success: true,
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
