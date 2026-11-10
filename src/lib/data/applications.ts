/**
 * Server-only data access for the application flow. All child/guardian PII is
 * encrypted before it reaches the database (encryptField) and decrypted only
 * here for display. Every call uses the request-scoped (user) Supabase client,
 * so RLS enforces that a guardian only ever touches their own records.
 */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptField, encryptOptional, decryptField } from "@/lib/security/crypto";

export type AgeGroup = "6-11" | "12-16";
export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "vetted"
  | "paired"
  | "waitlisted"
  | "accepted"
  | "declined";

export interface GuardianInput {
  fullName: string;
  phone?: string;
}
export interface Guardian {
  id: string;
  fullName: string;
  phone: string | null;
}

export interface ChildInput {
  fullName: string;
  dob: string; // ISO date
  ageGroup: AgeGroup;
  school?: string;
  notes?: string;
}
export interface Child {
  id: string;
  ageGroup: AgeGroup;
  fullName: string;
  dob: string;
  school: string | null;
  createdAt: string;
}

function dec(value: string | null): string | null {
  return value == null ? null : decryptField(value);
}

export async function getGuardian(supabase: SupabaseClient): Promise<Guardian | null> {
  const { data, error } = await supabase
    .from("guardians")
    .select("id, full_name_enc, phone_enc")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    fullName: decryptField(data.full_name_enc),
    phone: dec(data.phone_enc),
  };
}

export async function createGuardian(
  supabase: SupabaseClient,
  userId: string,
  input: GuardianInput,
): Promise<void> {
  const { error } = await supabase.from("guardians").insert({
    user_id: userId,
    full_name_enc: encryptField(input.fullName),
    phone_enc: encryptOptional(input.phone),
  });
  if (error) throw error;
}

export async function listChildren(supabase: SupabaseClient): Promise<Child[]> {
  const { data, error } = await supabase
    .from("children")
    .select("id, age_group, full_name_enc, dob_enc, school_enc, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    ageGroup: c.age_group as AgeGroup,
    fullName: decryptField(c.full_name_enc),
    dob: decryptField(c.dob_enc),
    school: dec(c.school_enc),
    createdAt: c.created_at,
  }));
}

export async function addChild(
  supabase: SupabaseClient,
  guardianId: string,
  input: ChildInput,
): Promise<void> {
  const { error } = await supabase.from("children").insert({
    guardian_id: guardianId,
    age_group: input.ageGroup,
    full_name_enc: encryptField(input.fullName),
    dob_enc: encryptField(input.dob),
    school_enc: encryptOptional(input.school),
    notes_enc: encryptOptional(input.notes),
  });
  if (error) throw error;
}
