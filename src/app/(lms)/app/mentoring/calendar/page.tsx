import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listEventsInRange, getEvent } from "@/lib/data/calendar";
import { monthRange, monthParam } from "@/lib/calendar-util";
import { Calendar } from "@/components/lms/Calendar";
import { EventList } from "@/components/lms/EventList";
import { EventForm } from "./EventForm";
import { deleteEventAction } from "./actions";

export const metadata: Metadata = { title: "Calendar" };

export default async function MentorCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; edit?: string }>;
}) {
  await requireRole(["mentor"]);
  const { m, edit } = await searchParams;
  const { year, month, start, end } = monthRange(m);
  const mParam = monthParam(year, month);
  const supabase = await createClient();
  const [events, editing] = await Promise.all([
    listEventsInRange(supabase, start, end),
    edit ? getEvent(supabase, edit) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/app/mentoring" className="text-sm text-ink-soft hover:text-ink">
        ← Mentoring
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Calendar</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Add classes, assessments and submission deadlines. Your mentees see these in their own calendar.
      </p>

      <div className="mt-6">
        <Calendar year={year} month={month} events={events} basePath="/app/mentoring/calendar" />
      </div>

      <div className="mt-8 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-forest">{editing ? "Edit event" : "Add an event"}</h2>
        <div className="mt-4">
          <EventForm
            event={
              editing
                ? {
                    id: editing.id,
                    title: editing.title,
                    type: editing.type,
                    date: editing.date,
                    startTime: editing.startTime,
                    endTime: editing.endTime,
                    description: editing.description,
                  }
                : undefined
            }
            defaultDate={`${mParam}-01`}
          />
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-forest">This month</h2>
      <div className="mt-3">
        <EventList
          events={events}
          emptyText="Nothing scheduled yet. Add your first event above."
          actions={(e) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/app/mentoring/calendar?m=${mParam}&edit=${e.id}`}
                className="rounded-[var(--radius)] border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
              >
                Edit
              </Link>
              <form action={deleteEventAction}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="m" value={mParam} />
                <button
                  type="submit"
                  className="rounded-[var(--radius)] border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
                >
                  Delete
                </button>
              </form>
            </div>
          )}
        />
      </div>
    </div>
  );
}
