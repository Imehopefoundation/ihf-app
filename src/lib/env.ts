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

/**
 * Gmail sending via the Gmail API with OAuth2 (CLAUDE.md: managed auth, no
 * custom password handling). We hold only a refresh token for the foundation
 * account and exchange it for short-lived access tokens server-side. Optional:
 * when unset, the app runs normally and email delivery is a no-op (dev).
 *   GMAIL_SENDER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 */
const emailSchema = z.object({
  GMAIL_SENDER: z.email(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
});

let cachedSupabase: z.infer<typeof supabaseSchema> | null = null;
let cachedServer: z.infer<typeof serverSchema> | null = null;
let cachedEmail: z.infer<typeof emailSchema> | null | undefined;

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

/**
 * Gmail OAuth config, or null if email isn't configured yet. Never throws for a
 * missing config (email is optional) — only for a partial/invalid one, so a
 * half-filled setup fails loudly rather than sending from nowhere.
 */
export function emailEnv(): z.infer<typeof emailSchema> | null {
  if (typeof window !== "undefined") {
    throw new Error("emailEnv() must never be called in the browser.");
  }
  if (cachedEmail !== undefined) return cachedEmail;

  const raw = {
    GMAIL_SENDER: process.env.GMAIL_SENDER,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  };
  const anySet = Object.values(raw).some((v) => v != null && v !== "");
  if (!anySet) {
    cachedEmail = null;
    return cachedEmail;
  }
  cachedEmail = emailSchema.parse(raw); // partial config => clear validation error
  return cachedEmail;
}

/** The shared secret that authorises the reminder cron route, or null. */
export function cronSecret(): string | null {
  if (typeof window !== "undefined") {
    throw new Error("cronSecret() must never be called in the browser.");
  }
  const s = process.env.CRON_SECRET;
  return s && s.length > 0 ? s : null;
}

/** Public base URL for building login links in emails. */
export function siteUrl(): string {
  return process.env.NEXT_SITE_URL ?? "https://imehopefoundation.org";
}
