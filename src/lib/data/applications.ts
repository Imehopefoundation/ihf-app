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

// ----------------------------------------------------------------------------
// Applications & consents
// ----------------------------------------------------------------------------

export type ConsentType = "biological_parent" | "spiritual_parent";

export interface ApplicationSummary {
  id: string;
  status: ApplicationStatus;
  programme: string;
  createdAt: string;
  childId: string;
  childName: string;
  ageGroup: AgeGroup;
  consents: ConsentType[];
}

export interface ApplicationDetail extends ApplicationSummary {
  school: string | null;
  guardianName: string;
  consentRecords: { type: ConsentType; grantedAt: string; policyVersion: string }[];
}

/** Create an application for one of the guardian's children. Returns its id. */
export async function createApplication(
  supabase: SupabaseClient,
  childId: string,
  programme: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("applications")
    .insert({ child_id: childId, programme })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/** The current guardian's applications (RLS scopes to their own). */
export async function listApplications(supabase: SupabaseClient): Promise<ApplicationSummary[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, status, programme, created_at, child:children(id, age_group, full_name_enc), consents(consent_type)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  // The untyped client returns `any` for nested selects; shape it safely.
  return (data ?? []).map((a: Record<string, unknown>) => {
    const child = a.child as { id: string; age_group: AgeGroup; full_name_enc: string };
    const consents = (a.consents as { consent_type: ConsentType }[] | null) ?? [];
    return {
      id: a.id as string,
      status: a.status as ApplicationStatus,
      programme: a.programme as string,
      createdAt: a.created_at as string,
      childId: child.id,
      childName: decryptField(child.full_name_enc),
      ageGroup: child.age_group,
      consents: consents.map((c) => c.consent_type),
    };
  });
}

/** One application in full, for the owning guardian (RLS enforced). */
export async function getApplication(
  supabase: SupabaseClient,
  id: string,
): Promise<ApplicationDetail | null> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, status, programme, created_at, child:children(id, age_group, full_name_enc, school_enc, guardian:guardians(full_name_enc)), consents(consent_type, granted_at, policy_version)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const a = data as Record<string, unknown>;
  const child = a.child as {
    id: string;
    age_group: AgeGroup;
    full_name_enc: string;
    school_enc: string | null;
    guardian: { full_name_enc: string };
  };
  const consents =
    (a.consents as { consent_type: ConsentType; granted_at: string; policy_version: string }[] | null) ??
    [];
  return {
    id: a.id as string,
    status: a.status as ApplicationStatus,
    programme: a.programme as string,
    createdAt: a.created_at as string,
    childId: child.id,
    childName: decryptField(child.full_name_enc),
    ageGroup: child.age_group,
    school: dec(child.school_enc),
    guardianName: decryptField(child.guardian.full_name_enc),
    consents: consents.map((c) => c.consent_type),
    consentRecords: consents.map((c) => ({
      type: c.consent_type,
      grantedAt: c.granted_at,
      policyVersion: c.policy_version,
    })),
  };
}

/** Record one consent (idempotent on the unique (application, type) pair). */
export async function recordConsent(
  supabase: SupabaseClient,
  applicationId: string,
  guardianId: string,
  consentType: ConsentType,
  policyVersion: string,
): Promise<void> {
  const { error } = await supabase.from("consents").insert({
    application_id: applicationId,
    consent_type: consentType,
    granted_by_guardian: guardianId,
    policy_version: policyVersion,
  });
  // 23505 = unique violation: the consent already exists, which is fine.
  if (error && (error as { code?: string }).code !== "23505") throw error;
}

// ----------------------------------------------------------------------------
// Staff review (programme_lead / quality_assurance / admin, via RLS)
// ----------------------------------------------------------------------------

export interface StaffApplication {
  id: string;
  status: ApplicationStatus;
  programme: string;
  createdAt: string;
  ageGroup: AgeGroup;
  consentCount: number;
  /** True only when BOTH required consents are on file. */
  consentComplete: boolean;
}

/**
 * All applications, for staff. Deliberately does NOT decrypt child or guardian
 * names (data minimisation): the pipeline is managed by reference, age group,
 * programme and status. A per-application detail view that reveals identity
 * logs a record_view — that is a later step.
 */
export async function listAllApplications(supabase: SupabaseClient): Promise<StaffApplication[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("id, status, programme, created_at, child:children(age_group), consents(consent_type)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((a: Record<string, unknown>) => {
    const child = a.child as { age_group: AgeGroup };
    const consents = (a.consents as { consent_type: ConsentType }[] | null) ?? [];
    return {
      id: a.id as string,
      status: a.status as ApplicationStatus,
      programme: a.programme as string,
      createdAt: a.created_at as string,
      ageGroup: child.age_group,
      consentCount: consents.length,
      consentComplete: consents.length >= 2,
    };
  });
}

/** Staff status change. Records who/when for terminal decisions. RLS enforces
 *  that only staff may update; the caller must also hold the right role. */
export async function setApplicationStatus(
  supabase: SupabaseClient,
  id: string,
  status: ApplicationStatus,
  actorId: string,
): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === "accepted" || status === "declined") {
    patch.decided_at = new Date().toISOString();
    patch.decided_by = actorId;
  }
  const { error } = await supabase.from("applications").update(patch).eq("id", id);
  if (error) throw error;
  // Record that a staff member acted on this application (append-only audit).
  await supabase.rpc("log_record_view", { _target_table: "applications", _target_id: id });
}
