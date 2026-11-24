import Link from "next/link";
import type { CalEvent, EventType } from "@/lib/data/calendar";
import { MONTH_NAMES, shiftMonth, formatTime, todayISO } from "@/lib/calendar-util";

export const EVENT_CHIP: Record<EventType, string> = {
  class: "bg-give-tint text-give-dark",
  assessment: "bg-amber-50 text-amber-800",
  submission: "bg-forest/10 text-forest",
  other: "bg-cream-100 text-ink-soft",
};
export const EVENT_LABEL: Record<EventType, string> = {
  class: "Class",
  assessment: "Assessment",
  submission: "Submission",
  other: "Event",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Read-only month grid with event chips and month navigation. */
export function Calendar({
  year,
  month,
  events,
  basePath,
}: {
  year: number;
  month: number;
  events: CalEvent[];
  basePath: string;
}) {
  const startWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = todayISO();

  const byDate = new Map<string, CalEvent[]>();
  for (const e of events) {
    const arr = byDate.get(e.date) ?? [];
    arr.push(e);
    byDate.set(e.date, arr);
  }

  const cells: ({ day: number; date: string } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: `${year}-${pad(month)}-${pad(d)}` });

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const navBtn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius)] border border-cream-200 px-2 text-sm text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <Link href={`${basePath}?m=${prev}`} aria-label="Previous month" className={navBtn}>
            ←
          </Link>
          <Link href={basePath} className={navBtn}>
            Today
          </Link>
          <Link href={`${basePath}?m=${next}`} aria-label="Next month" className={navBtn}>
            →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius)] border border-cream-200 bg-cream-200">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-cream-100 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            <span className="hidden sm:inline">{w}</span>
            <span className="sm:hidden">{w[0]}</span>
          </div>
        ))}
        {cells.map((c, i) => (
          <div key={i} className={`min-h-[76px] p-1.5 sm:min-h-[92px] ${c ? "bg-white" : "bg-cream/40"}`}>
            {c && (
              <>
                <div
                  className={
                    c.date === today
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[11px] font-semibold text-cream"
                      : "text-[11px] font-medium text-ink-soft"
                  }
                >
                  {c.day}
                </div>
                <div className="mt-1 space-y-1">
                  {(byDate.get(c.date) ?? []).slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={`truncate rounded px-1.5 py-0.5 text-[11px] ${EVENT_CHIP[e.type]}`}
                      title={`${formatTime(e.startTime) ?? ""} ${e.title}`.trim()}
                    >
                      {formatTime(e.startTime) ? `${formatTime(e.startTime)} ` : ""}
                      {e.title}
                    </div>
                  ))}
                  {(byDate.get(c.date)?.length ?? 0) > 3 && (
                    <div className="text-[10px] text-ink-soft">+{(byDate.get(c.date)?.length ?? 0) - 3} more</div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
