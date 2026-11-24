import type { Metadata } from "next";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfileName } from "@/lib/data/profile";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/app/(auth)/actions";
import { NameForm } from "./NameForm";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const { user, roles } = await requireSessionUser("/app/account");
  const supabase = await createClient();
  const name = await getProfileName(supabase, user.id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-ink">Your name</h1>
        <p className="mt-1 mb-4 text-sm text-ink-soft">This is how we greet you in the LMS.</p>
        <NameForm currentName={name} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-ink">Account details</h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-ink-soft">Signed in as</dt>
            <dd className="break-words text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink-soft">Roles</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((r) => (
                  <StatusChip key={r} tone="info">
                    {r.replace(/_/g, " ")}
                  </StatusChip>
                ))
              ) : (
                <span className="text-ink-soft">Member (no staff roles)</span>
              )}
            </dd>
          </div>
        </dl>
        <form action={signOut} className="mt-8">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
