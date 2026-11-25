import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Session {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  devotionDone: boolean;
  codeOfConductRead: boolean;
  notes: string | null;
  createdBy: string;
}

export interface SessionInput {
  title: string;
  date: string;
  devotionDone: boolean;
  codeOfConductRead: boolean;
  notes?: string | null;
}

const COLS = "id, title, session_date, devotion_done, code_of_conduct_read, notes, created_by";

function mapSession(r: Record<string, unknown>): Session {
  return {
    id: r.id as string,
    title: r.title as string,
    date: r.session_date as string,
    devotionDone: Boolean(r.devotion_done),
    codeOfConductRead: Boolean(r.code_of_conduct_read),
    notes: (r.notes as string | null) ?? null,
    createdBy: r.created_by as string,
  };
}

/** All sessions (mentees view; RLS allows mentor/mentee/admin). */
export async function listSessions(supabase: SupabaseClient): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(COLS)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSession);
}

/** Only the sessions this mentor recorded. */
export async function listMySessions(supabase: SupabaseClient, userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(COLS)
    .eq("created_by", userId)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSession);
}

export async function createSession(
  supabase: SupabaseClient,
  userId: string,
  input: SessionInput,
): Promise<void> {
  const { error } = await supabase.from("sessions").insert({
    created_by: userId,
    title: input.title,
    session_date: input.date,
    devotion_done: input.devotionDone,
    code_of_conduct_read: input.codeOfConductRead,
    notes: input.notes || null,
  });
  if (error) throw error;
}

export async function deleteSession(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}
