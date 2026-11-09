/**
 * Environment validation. Parsed lazily so an unconfigured build doesn't crash
 * before Supabase is wired, but any code that actually uses these values gets a
 * clear, early failure if they're missing. Values are never logged.
 *
 * Only NEXT_PUBLIC_* reach the browser bundle. The service_role key is read via
 * serverEnv(), which refuses to run in the browser (CLAUDE.md: service_role is
 * server-only, never in client bundles, never in NEXT_PUBLIC_).
 */
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

let cachedPublic: z.infer<typeof publicSchema> | null = null;
let cachedServer: z.infer<typeof serverSchema> | null = null;

export function publicEnv() {
  if (!cachedPublic) {
    cachedPublic = publicSchema.parse({
      // Referenced statically so Next can inline NEXT_PUBLIC_* at build time.
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
  }
  return cachedPublic;
}

export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must never be called in the browser.");
  }
  if (!cachedServer) {
    cachedServer = serverSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  return cachedServer;
}
