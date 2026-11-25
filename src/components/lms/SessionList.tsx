import type { ReactNode } from "react";
import type { Session } from "@/lib/data/sessions";

function prettyDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-cream-200 bg-cream-100 text-ink-soft"
      }`}
    >
      <span aria-hidden="true">{ok ? "✓" : "—"}</span> {label}
    </span>
  );
}

export function SessionList({
  sessions,
  actions,
  emptyText,
}: {
  sessions: Session[];
  actions?: (s: Session) => ReactNode;
  emptyText?: string;
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-cream-200 bg-cream/40 p-6 text-center text-sm text-ink-soft">
        {emptyText ?? "No sessions recorded yet."}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-cream-200 rounded-[var(--radius-lg)] border border-cream-200 bg-white">
      {sessions.map((s) => (
        <li key={s.id} className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="font-medium text-ink">{s.title}</p>
            <p className="mt-0.5 text-sm text-ink-soft">{prettyDate(s.date)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Flag ok={s.devotionDone} label="Devotion" />
              <Flag ok={s.codeOfConductRead} label="Code of Conduct" />
            </div>
            {s.notes && <p className="mt-2 text-sm text-ink-soft">{s.notes}</p>}
          </div>
          {actions && <div className="shrink-0">{actions(s)}</div>}
        </li>
      ))}
    </ul>
  );
}
