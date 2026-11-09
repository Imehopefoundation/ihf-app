/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * User-scoped (anon key + the request's auth cookie) so every query runs under
 * the caller's RLS context — this is the preferred client (CLAUDE.md).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only; the
          // session refresh in the proxy handles cookie writes instead.
        }
      },
    },
  });
}
