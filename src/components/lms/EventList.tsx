import type { ReactNode } from "react";
import type { CalEvent } from "@/lib/data/calendar";
import { formatTime } from "@/lib/calendar-util";
import { EVENT_CHIP, EVENT_LABEL } from "./Calendar";

function prettyDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** A sorted list of events. `actions` renders per-event controls (edit/delete). */
export function EventList({
  events,
  actions,
  emptyText,
}: {
  events: CalEvent[];
  actions?: (e: CalEvent) => ReactNode;
  emptyText?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-cream-200 bg-cream/40 p-6 text-center text-sm text-ink-soft">
        {emptyText ?? "Nothing scheduled this month."}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-cream-200 rounded-[var(--radius-lg)] border border-cream-200 bg-white">
      {events.map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${EVENT_CHIP[e.type]}`}>
                {EVENT_LABEL[e.type]}
              </span>
              <p className="font-medium text-ink">{e.title}</p>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {prettyDate(e.date)}
              {formatTime(e.startTime)
                ? ` · ${formatTime(e.startTime)}${formatTime(e.endTime) ? `–${formatTime(e.endTime)}` : ""}`
                : ""}
            </p>
            {e.description && <p className="mt-1 text-sm text-ink-soft">{e.description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions(e)}</div>}
        </li>
      ))}
    </ul>
  );
}
