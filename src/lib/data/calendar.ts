import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EventType = "class" | "assessment" | "submission" | "other";

export interface CalEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM:SS
  endTime: string | null;
  description: string | null;
  createdBy: string;
}

export interface EventInput {
  title: string;
  type: EventType;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
}

const COLS = "id, title, event_type, event_date, start_time, end_time, description, created_by";

function mapEvent(r: Record<string, unknown>): CalEvent {
  return {
    id: r.id as string,
    title: r.title as string,
    type: r.event_type as EventType,
    date: r.event_date as string,
    startTime: (r.start_time as string | null) ?? null,
    endTime: (r.end_time as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    createdBy: r.created_by as string,
  };
}

export async function listEventsInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
): Promise<CalEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select(COLS)
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export async function getEvent(supabase: SupabaseClient, id: string): Promise<CalEvent | null> {
  const { data, error } = await supabase.from("calendar_events").select(COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapEvent(data) : null;
}

export async function createEvent(
  supabase: SupabaseClient,
  userId: string,
  input: EventInput,
): Promise<void> {
  const { error } = await supabase.from("calendar_events").insert({
    created_by: userId,
    title: input.title,
    event_type: input.type,
    event_date: input.date,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    description: input.description || null,
  });
  if (error) throw error;
}

export async function updateEvent(
  supabase: SupabaseClient,
  id: string,
  input: EventInput,
): Promise<void> {
  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: input.title,
      event_type: input.type,
      event_date: input.date,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      description: input.description || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) throw error;
}
