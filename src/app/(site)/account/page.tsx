import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/site/primitives";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/Button";
import { signOut } from "../auth/actions";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: roles } = await supabase.from("user_roles").select("role");

  return (
    <Section tone="cream" className="pt-16">
      <div className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-forest">Your account</h1>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-ink-soft">Signed in as</dt>
            <dd className="text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink-soft">Roles</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {roles && roles.length > 0 ? (
                roles.map((r) => (
                  <StatusChip key={r.role} tone="info">
                    {String(r.role).replace(/_/g, " ")}
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
    </Section>
  );
}
