import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listAllApplications, type ApplicationStatus } from "@/lib/data/applications";
import { StatusChip, APPLICATION_STATUS_TONE } from "@/components/ui/StatusChip";
import { EmptyState } from "@/components/ui/Table";
import { setStatusAction } from "./actions";

export const metadata: Metadata = { title: "Review queue" };

const STATUSES: readonly ApplicationStatus[] = [
  "submitted",
  "under_review",
  "vetted",
  "paired",
  "waitlisted",
  "accepted",
  "declined",
];

function statusTone(status: string) {
  return APPLICATION_STATUS_TONE[status.replace(/_/g, " ")] ?? "neutral";
}

export default async function ReviewPage() {
  await requireRole(["programme_lead", "quality_assurance"]);
  const supabase = await createClient();
  const apps = await listAllApplications(supabase);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Review queue</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Applications move through submitted → under review → vetted →
        paired/waitlisted → accepted/declined. Applications are shown by
        reference and age group only; opening a child&apos;s record (identity)
        is a separate, audit-logged step.
      </p>

      <div className="mt-8 space-y-3">
        {apps.length === 0 ? (
          <EmptyState title="Nothing to review.">New applications will appear here.</EmptyState>
        ) : (
          apps.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  IHF-{a.id.slice(0, 8).toUpperCase()}
                  <span className="ml-2 font-normal text-ink-soft">· {a.programme}</span>
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  Age group {a.ageGroup} ·{" "}
                  {a.consentComplete ? "consent complete" : `consent ${a.consentCount}/2`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusChip tone={statusTone(a.status)}>{a.status.replace(/_/g, " ")}</StatusChip>
                <form action={setStatusAction} className="flex items-center gap-2">
                  <input type="hidden" name="applicationId" value={a.id} />
                  <label htmlFor={`status-${a.id}`} className="sr-only">
                    Set status for IHF-{a.id.slice(0, 8).toUpperCase()}
                  </label>
                  <select
                    id={`status-${a.id}`}
                    name="status"
                    defaultValue={a.status}
                    className="rounded-[var(--radius)] border border-cream-200 bg-white px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-forest"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-[var(--radius)] border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
