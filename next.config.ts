import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,
  reactStrictMode: true,
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
