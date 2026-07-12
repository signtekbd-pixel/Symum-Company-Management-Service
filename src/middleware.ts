import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
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

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
    if (isProtected) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const role = (req.auth.user as any)?.role;
  const allowedRoutes = roleAllowedRoutes[role as keyof typeof roleAllowedRoutes] || [];
  const isAllowed = allowedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));

  if (!isAllowed && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

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
