import { describe, it, expect } from "vitest";
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
} from "./headers";

const NONCE = "dGVzdC1ub25jZQ=="; // "test-nonce" base64

function parseCsp(csp: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of csp.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [name, ...rest] = trimmed.split(/\s+/);
    out[name] = rest.join(" ");
  }
  return out;
}

describe("Content-Security-Policy (production)", () => {
  const csp = buildContentSecurityPolicy({ nonce: NONCE, isDev: false });
  const directives = parseCsp(csp);

  it("uses the request nonce with strict-dynamic for scripts", () => {
    expect(directives["script-src"]).toContain(`'nonce-${NONCE}'`);
    expect(directives["script-src"]).toContain("'strict-dynamic'");
  });

  it("never allows unsafe-inline or unsafe-eval in production", () => {
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("locks down default-src, object-src, base-uri and frame-ancestors", () => {
    expect(directives["default-src"]).toBe("'self'");
    expect(directives["object-src"]).toBe("'none'");
    expect(directives["base-uri"]).toBe("'none'");
    expect(directives["frame-ancestors"]).toBe("'none'");
    expect(directives["form-action"]).toBe("'self'");
  });

  it("upgrades insecure requests", () => {
    expect(csp).toContain("upgrade-insecure-requests");
  });
});

describe("Content-Security-Policy (development)", () => {
  it("relaxes only enough for HMR", () => {
    const csp = buildContentSecurityPolicy({ nonce: NONCE, isDev: true });
    expect(csp).toContain("'unsafe-eval'");
    // but still keeps the structural lockdowns
    expect(parseCsp(csp)["frame-ancestors"]).toBe("'none'");
    expect(parseCsp(csp)["object-src"]).toBe("'none'");
  });
});

describe("buildSecurityHeaders", () => {
  const headers = buildSecurityHeaders({ nonce: NONCE, isDev: false });

  it("includes every required security header", () => {
    const required = [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "X-Frame-Options",
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
    ];
    for (const name of required) {
      expect(headers[name], `${name} must be present`).toBeTruthy();
    }
  });

  it("sets HSTS with preload and a long max-age", () => {
    expect(headers["Strict-Transport-Security"]).toContain("preload");
    expect(headers["Strict-Transport-Security"]).toMatch(/max-age=\d{7,}/);
  });

  it("denies camera, microphone and geolocation", () => {
    const pp = headers["Permissions-Policy"];
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
    expect(pp).toContain("geolocation=()");
  });

  it("sets nosniff, strict referrer policy and frame denial", () => {
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["Cross-Origin-Resource-Policy"]).toBe("same-origin");
  });
});
