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
