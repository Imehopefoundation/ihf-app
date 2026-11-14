import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,
  reactStrictMode: true,
  // Old URLs → new Website/LMS split locations (keeps external links working).
  async redirects() {
    return [
      { source: "/auth", destination: "/sign-in", permanent: true },
      { source: "/auth/sign-up", destination: "/sign-up", permanent: true },
      { source: "/auth/confirm", destination: "/confirm", permanent: false },
      { source: "/account", destination: "/app/account", permanent: true },
      { source: "/apply", destination: "/app/apply", permanent: true },
    ];
  },
  // NOTE: `cacheComponents`/`partialPrefetching` are intentionally OFF.
  // A strict per-request nonce CSP (see src/proxy.ts) requires pages to be
  // rendered per request so Next can tag scripts with that request's nonce.
  // Component-level caching is revisited once public pages are segmented from
  // authenticated ones (tracked in docs/OPEN_ITEMS.md).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
