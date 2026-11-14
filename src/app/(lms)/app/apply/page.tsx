import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGuardian, listChildren } from "@/lib/data/applications";
import { Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";
import { GuardianForm, AddChildForm } from "./ApplyForms";

export const metadata: Metadata = { title: "Apply" };

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const guardian = await getGuardian(supabase);
  const children = guardian ? await listChildren(supabase) : [];

  return (
    <div className="mx-auto max-w-5xl">
      <Eyebrow>Apply</Eyebrow>
      <SectionTitle>{guardian ? `Welcome, ${guardian.fullName}` : "Register as a parent or guardian"}</SectionTitle>
      <Lead>
        For ages 6–11 the parent or guardian does everything; for 12–16 a
        supervised teen account follows once consent is given.
      </Lead>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {!guardian ? (
          <Card>
            <h2 className="text-lg font-semibold text-forest">Your details</h2>
            <p className="mt-1 mb-4 text-sm text-ink-soft">
              Your details are encrypted and visible only to authorised IHF staff.
            </p>
            <GuardianForm />
          </Card>
        ) : (
          <Card>
            <h2 className="text-lg font-semibold text-forest">Add a child</h2>
            <p className="mt-1 mb-4 text-sm text-ink-soft">
              You can add each child you are applying on behalf of.
            </p>
            <AddChildForm />
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold text-forest">Your children</h2>
          <div className="mt-4 space-y-3">
            {children.length === 0 ? (
              <EmptyState title="No children added yet.">
                {guardian ? "Add a child to begin an application." : "Register first, then add a child."}
              </EmptyState>
            ) : (
              children.map((c) => (
                <div key={c.id} className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-4">
                  <p className="font-medium text-ink">{c.fullName}</p>
                  <p className="text-sm text-ink-soft">
                    Age group {c.ageGroup}
                    {c.school ? ` · ${c.school}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
