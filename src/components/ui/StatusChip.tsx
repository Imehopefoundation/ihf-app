import { cn } from "@/lib/cn";

/** Application statuses (CLAUDE.md) plus generic tones for dashboards. */
export type StatusTone =
  | "neutral"
  | "info"
  | "progress"
  | "success"
  | "warning"
  | "danger";

const tones: Record<StatusTone, string> = {
  neutral: "bg-cream-100 text-ink-soft border-cream-200",
  info: "bg-forest/5 text-forest border-forest/20",
  progress: "bg-amber-50 text-amber-800 border-amber-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
  danger: "bg-red-50 text-red-800 border-red-200",
};

/** Maps the application statuses from CLAUDE.md to a tone. */
export const APPLICATION_STATUS_TONE: Record<string, StatusTone> = {
  submitted: "info",
  "under review": "progress",
  vetted: "progress",
  paired: "success",
  waitlisted: "warning",
  accepted: "success",
  declined: "danger",
};

export function StatusChip({ children, tone = "neutral" }: { children: string; tone?: StatusTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
