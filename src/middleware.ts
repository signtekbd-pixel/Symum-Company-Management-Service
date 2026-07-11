import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

  // Check if the route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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
