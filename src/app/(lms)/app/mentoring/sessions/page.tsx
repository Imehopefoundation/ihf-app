import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listMySessions } from "@/lib/data/sessions";
import { SessionList } from "@/components/lms/SessionList";
import { SessionForm } from "./SessionForm";
import { deleteSessionAction } from "./actions";

export const metadata: Metadata = { title: "Sessions" };

export default async function MentorSessionsPage() {
  const { user } = await requireRole(["mentor"]);
  const supabase = await createClient();
  const sessions = await listMySessions(supabase, user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/mentoring" className="text-sm text-ink-soft hover:text-ink">
        ← Mentoring
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Sessions</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Record that a session happened — devotion and Code of Conduct. Your mentees can see the record.
      </p>

      <div className="mt-6 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
        <SessionForm />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-forest">Recorded sessions</h2>
      <div className="mt-3">
        <SessionList
          sessions={sessions}
          emptyText="No sessions recorded yet. Record your first one above."
          actions={(s) => (
            <form action={deleteSessionAction}>
              <input type="hidden" name="id" value={s.id} />
              <button
                type="submit"
                className="rounded-[var(--radius)] border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
              >
                Delete
              </button>
            </form>
          )}
        />
      </div>
    </div>
  );
}
