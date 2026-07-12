import { NextResponse, type NextRequest } from "next/server";
import { roleAllowedRoutes } from "@/lib/roles";

const protectedRoutes = [
  "/dashboard",
  "/customers",
  "/orders",
  "/products",
  "/inventory",
  "/invoicing",
  "/production",
  "/proofs",
  "/reports",
  "/settings",
];

function isProtected(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (session.user as any)?.role;
    const allowedRoutes = roleAllowedRoutes[role as keyof typeof roleAllowedRoutes] || [];
    const isAllowed = allowedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error (DB may be down):", error);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/invoicing/:path*",
    "/production/:path*",
    "/proofs/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
