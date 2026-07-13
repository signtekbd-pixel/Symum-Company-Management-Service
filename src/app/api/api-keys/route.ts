import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { requireSuperAdmin, apiError } from "@/lib/api-auth";

function generateApiKey() {
  const prefix = "pk_";
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return { key: prefix + randomBytes, prefix: prefix + randomBytes.slice(0, 8), hash: crypto.createHash("sha256").update(prefix + randomBytes).digest("hex") };
}

export async function GET() {
  try {
    const session = await requireSuperAdmin();
    const keys = await prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ keys });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin();
    const body = await request.json();
    const { name, scopes, expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const { key, prefix, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash: hash,
        keyPrefix: prefix,
        scopes: scopes || [],
        userId: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ...apiKey, key }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
