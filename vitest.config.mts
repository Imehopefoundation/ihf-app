import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // jsdom + testing-library are added for component tests in a later phase.
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Next resolves `server-only` at build time; stub it so server modules
      // (which correctly guard themselves with it) are unit-testable.
      "server-only": fileURLToPath(new URL("./src/test/stubs/server-only.ts", import.meta.url)),
    },
  },
});
