/**
 * Environment validation. Parsed lazily so an unconfigured build doesn't crash
 * before Supabase is wired, but any code that actually uses these values gets a
 * clear, early failure if they're missing. Values are never logged.
 *
 * Supabase runs ENTIRELY server-side in this app (no browser Supabase client),
 * so its URL and anon key are read from plain, non-public env vars and are never
 * shipped to the browser bundle. The service_role key is read via serverEnv(),
 * which refuses to run in the browser.
 *
 * Vercel / .env var names:
 *   NEXT_SUPABASE_URL, NEXT_SUPABASE_ANON_KEY, NEXT_SITE_URL (optional),
 *   SUPABASE_SERVICE_ROLE_KEY, FIELD_ENCRYPTION_KEY.
 */
import { z } from "zod";

const supabaseSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SITE_URL: z.url().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

let cachedSupabase: z.infer<typeof supabaseSchema> | null = null;
let cachedServer: z.infer<typeof serverSchema> | null = null;

/** Supabase connection config (server-only; URL + anon key). */
export function supabaseEnv() {
  if (typeof window !== "undefined") {
    throw new Error("supabaseEnv() must never be called in the browser.");
  }
  if (!cachedSupabase) {
    cachedSupabase = supabaseSchema.parse({
      SUPABASE_URL: process.env.NEXT_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_SUPABASE_ANON_KEY,
      SITE_URL: process.env.NEXT_SITE_URL,
    });
  }
  return cachedSupabase;
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
