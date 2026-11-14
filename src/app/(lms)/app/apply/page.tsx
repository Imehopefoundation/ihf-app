import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGuardian, listChildren, listApplications } from "@/lib/data/applications";
import { PROGRAMMES } from "@/lib/content/programmes";
import { Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";
import { StatusChip, APPLICATION_STATUS_TONE } from "@/components/ui/StatusChip";
import { GuardianForm, AddChildForm } from "./ApplyForms";
import { createApplicationAction } from "./actions";

export const metadata: Metadata = { title: "Apply" };

function statusTone(status: string) {
  return APPLICATION_STATUS_TONE[status.replace(/_/g, " ")] ?? "neutral";
}

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const guardian = await getGuardian(supabase);
  const children = guardian ? await listChildren(supabase) : [];
  const applications = guardian ? await listApplications(supabase) : [];

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
                  <form action={createApplicationAction} className="mt-3 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="childId" value={c.id} />
                    <label htmlFor={`prog-${c.id}`} className="sr-only">
                      Programme for {c.fullName}
                    </label>
                    <select
                      id={`prog-${c.id}`}
                      name="programme"
                      defaultValue={PROGRAMMES[0]}
                      className="rounded-[var(--radius)] border border-cream-200 bg-white px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-forest"
                    >
                      {PROGRAMMES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-[var(--radius)] bg-forest px-3 py-1.5 text-sm font-medium text-cream hover:bg-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      Apply
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {guardian && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-forest">Your applications</h2>
          <div className="mt-4 space-y-3">
            {applications.length === 0 ? (
              <EmptyState title="No applications yet.">
                Choose a programme for one of your children above to begin.
              </EmptyState>
            ) : (
              applications.map((a) => (
                <Link
                  key={a.id}
                  href={`/app/apply/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-4 transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <div>
                    <p className="font-medium text-ink">{a.childName}</p>
                    <p className="text-sm text-ink-soft">{a.programme}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-soft">Consent {a.consents.length}/2</span>
                    <StatusChip tone={statusTone(a.status)}>{a.status.replace(/_/g, " ")}</StatusChip>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
