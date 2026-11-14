import { NextRequest, NextResponse } from "next/server";
import { buildSecurityHeaders, NONCE_HEADER } from "@/lib/security/headers";

/**
 * Edge proxy (Next 16's renamed "middleware"): attach a per-request nonce and
 * the full security header set to every response. The CSP is also set on the
 * *request* headers so Next.js picks up the nonce and tags its own framework
 * scripts with it.
 *
 * See docs/SECURITY.md. Rules enforced here are additionally asserted by
 * src/lib/security/headers.test.ts.
 */
export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";

  // 128 bits of randomness, base64-encoded. crypto is available on the edge runtime.
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");

  const headers = buildSecurityHeaders({ nonce, isDev });

  // LMS auth gate (defence in depth). This is a fast cookie-presence check only
  // — the authoritative checks are the LMS layout's getUser() (Node runtime) and
  // RLS. We deliberately avoid a Supabase network call in the edge proxy so the
  // gate never depends on edge-runtime egress. A present-but-invalid cookie is
  // still caught server-side and sent back here on the next request.
  const path = request.nextUrl.pathname;
  const isLms = path === "/app" || path.startsWith("/app/");
  if (isLms) {
    const hasAuthCookie = request.cookies
      .getAll()
      .some((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name));
    if (!hasAuthCookie) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("next", path);
      const redirect = NextResponse.redirect(signInUrl);
      for (const [name, value] of Object.entries(headers)) {
        redirect.headers.set(name, value);
      }
      return redirect;
    }
  }

  // Forward the nonce (and CSP) to the app via request headers so Server
  // Components can read the nonce and Next can nonce its injected scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set("Content-Security-Policy", headers["Content-Security-Policy"]);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  // Apply to everything except Next's static output and image optimizer, and
  // common static asset extensions (which never execute script).
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
    },
  ],
};
