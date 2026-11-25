import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listSessions } from "@/lib/data/sessions";
import { SessionList } from "@/components/lms/SessionList";

export const metadata: Metadata = { title: "Sessions" };

export default async function MenteeSessionsPage() {
  await requireRole(["mentee"]);
  const supabase = await createClient();
  const sessions = await listSessions(supabase);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/learning" className="text-sm text-ink-soft hover:text-ink">
        ← My learning
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Sessions</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A record of your sessions — devotion and Code of Conduct.
      </p>

      <div className="mt-6">
        <SessionList sessions={sessions} emptyText="No sessions recorded yet." />
      </div>
    </div>
  );
}
