import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptField, decryptField } from "@/lib/security/crypto";

/** The user's display name (decrypted), or null if not set. */
export async function getProfileName(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name_enc")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const enc = (data?.full_name_enc as string | null | undefined) ?? null;
  return enc ? decryptField(enc) : null;
}

export async function setProfileName(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name_enc: encryptField(name) })
    .eq("id", userId);
  if (error) throw error;
}
