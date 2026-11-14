import type { Metadata } from "next";
import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/session";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const { user, roles } = await requireSessionUser("/app/account");

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-ink">Your account</h1>
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
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/app/apply" className="text-sm font-semibold text-forest hover:underline">
            Start or continue an application →
          </Link>
        </div>
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
