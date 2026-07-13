import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";

interface AuthSession {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: string;
  };
}

const SUPER_ADMIN_ROLES = ["DEV", "SUPER_ADMIN"];
const ADMIN_ROLES = ["DEV", "SUPER_ADMIN", "ADMIN"];

export async function requireAuth(): Promise<AuthSession> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }
  return session as unknown as AuthSession;
}

export async function requireSuperAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (!SUPER_ADMIN_ROLES.includes(session.user.role)) {
    throw new ApiError(403, "Forbidden: Super Admin access required");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (!ADMIN_ROLES.includes(session.user.role)) {
    throw new ApiError(403, "Forbidden: Admin access required");
  }
  return session;
}

export function apiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
