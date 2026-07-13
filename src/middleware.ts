import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token")?.value
    || request.cookies.get("__Secure-authjs.session-token")?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
    || request.nextUrl.pathname.startsWith("/signup");

  if (!sessionToken && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/branches/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/product-categories/:path*",
    "/inventory/:path*",
    "/material-categories/:path*",
    "/suppliers/:path*",
    "/invoicing/:path*",
    "/production/:path*",
    "/machines/:path*",
    "/proofs/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/audit-logs/:path*",
    "/system-settings/:path*",
    "/approvals/:path*",
    "/system-health/:path*",
    "/api-keys/:path*",
    "/login",
    "/signup",
  ],
};
