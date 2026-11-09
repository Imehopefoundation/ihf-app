/**
 * SERVER-ONLY Supabase admin client (service_role key).
 *
 * CLAUDE.md: "The Supabase service_role key is server-only … Prefer user-scoped
 * clients; use service_role only in a small, reviewed server module." This is
 * that module. The service_role key bypasses RLS, so use it only for narrow,
 * audited operations that genuinely cannot run under a user's context, and
 * never expose it to the client.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

if (typeof window !== "undefined") {
  // Hard stop: importing this anywhere that ships to the browser is a bug.
  throw new Error("supabase/admin must never be imported in client code.");
}

export function createAdminClient() {
  const pub = publicEnv();
  const srv = serverEnv();
  return createSupabaseClient(pub.NEXT_PUBLIC_SUPABASE_URL, srv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
