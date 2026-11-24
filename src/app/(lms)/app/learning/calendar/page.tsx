import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listEventsInRange } from "@/lib/data/calendar";
import { monthRange } from "@/lib/calendar-util";
import { Calendar } from "@/components/lms/Calendar";
import { EventList } from "@/components/lms/EventList";

export const metadata: Metadata = { title: "Calendar" };

export default async function MenteeCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  await requireRole(["mentee"]);
  const { m } = await searchParams;
  const { year, month, start, end } = monthRange(m);
  const supabase = await createClient();
  const events = await listEventsInRange(supabase, start, end);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/app/learning" className="text-sm text-ink-soft hover:text-ink">
        ← My learning
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Calendar</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Your classes, assessments and deadlines — see what you have this month.
      </p>

      <div className="mt-6">
        <Calendar year={year} month={month} events={events} basePath="/app/learning/calendar" />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-forest">This month</h2>
      <div className="mt-3">
        <EventList events={events} emptyText="Nothing scheduled yet this month." />
      </div>
    </div>
  );
}
