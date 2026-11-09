/**
 * Security headers and Content-Security-Policy builder.
 *
 * Pure functions, no framework imports, so they can be unit-tested directly
 * and reused from middleware. See docs/SECURITY.md for the rationale.
 *
 * CLAUDE.md requires: strict CSP with nonces (no unsafe-inline / unsafe-eval),
 * HSTS with preload, X-Content-Type-Options nosniff, Referrer-Policy
 * strict-origin-when-cross-origin, Permissions-Policy denying camera /
 * microphone / geolocation by default, frame-ancestors 'none', COOP/CORP.
 */

export interface SecurityHeaderOptions {
  /** Per-request nonce (base64). Required in production for the strict CSP. */
  nonce: string;
  /** When true, relax script/style rules just enough for the dev server (HMR). */
  isDev?: boolean;
}

/**
 * Build the Content-Security-Policy header value.
 *
 * Production: `script-src 'nonce-<nonce>' 'strict-dynamic'` — the only scripts
 * that run are the ones Next.js marks with this request's nonce, plus whatever
 * they choose to load (strict-dynamic). No host allowlist, no 'unsafe-inline',
 * no 'unsafe-eval'.
 *
 * Development: the Next/Turbopack dev runtime needs 'unsafe-eval' (and inline)
 * for hot-module replacement, so we loosen ONLY in dev. Production is strict.
 */
export function buildContentSecurityPolicy({ nonce, isDev = false }: SecurityHeaderOptions): string {
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval'`
    : `'nonce-${nonce}' 'strict-dynamic'`;

  // Style attributes injected by the framework/font loader are nonce-tagged by
  // Next; we additionally allow 'self' stylesheets. No 'unsafe-inline'.
  const styleSrc = isDev ? `'self' 'unsafe-inline'` : `'self' 'nonce-${nonce}'`;

  const directives: Array<[string, string]> = [
    ["default-src", `'self'`],
    ["base-uri", `'none'`],
    ["object-src", `'none'`],
    ["frame-ancestors", `'none'`],
    ["form-action", `'self'`],
    ["script-src", scriptSrc],
    ["style-src", styleSrc],
    ["img-src", `'self' blob: data:`],
    ["font-src", `'self'`],
    // No user-supplied remote origins yet. Supabase/Paystack endpoints are
    // added here (as explicit hosts) in the phase that introduces them.
    ["connect-src", `'self'`],
    ["manifest-src", `'self'`],
    ["worker-src", `'self' blob:`],
    ["frame-src", `'none'`],
    ["upgrade-insecure-requests", ""],
  ];

  return directives
    .map(([name, value]) => (value ? `${name} ${value}` : name))
    .join("; ");
}

/**
 * The full set of security response headers, including the CSP.
 * Returned as a plain object so it is trivial to assert over in tests.
 */
export function buildSecurityHeaders(options: SecurityHeaderOptions): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(options),
    // 2 years, subdomains, preload-list eligible.
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
    // Legacy clickjacking guard; frame-ancestors 'none' in the CSP is the modern one.
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off",
  };
}

/** Header name that carries the per-request nonce to Server Components. */
export const NONCE_HEADER = "x-nonce";
