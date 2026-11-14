import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplication, type ConsentType } from "@/lib/data/applications";
import { CURRENT_POLICY_VERSION, CONSENT_LABELS } from "@/lib/content/policy";
import { StatusChip, APPLICATION_STATUS_TONE } from "@/components/ui/StatusChip";
import { recordConsentAction } from "../actions";

export const metadata: Metadata = { title: "Application" };

const CONSENT_ORDER: ConsentType[] = ["biological_parent", "spiritual_parent"];

function statusTone(status: string) {
  return APPLICATION_STATUS_TONE[status.replace(/_/g, " ")] ?? "neutral";
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const app = await getApplication(supabase, id);
  if (!app) redirect("/app/apply");

  const given = new Map(app.consentRecords.map((c) => [c.type, c]));
  const bothConsented = CONSENT_ORDER.every((t) => given.has(t));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/apply" className="text-sm text-ink-soft hover:text-ink">
        ← Back to applications
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{app.childName}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {app.programme} · age group {app.ageGroup}
            {app.school ? ` · ${app.school}` : ""}
          </p>
        </div>
        <StatusChip tone={statusTone(app.status)}>{app.status.replace(/_/g, " ")}</StatusChip>
      </div>

      {/* Dual consent */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-forest">Consent</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Consent is required from <strong>both</strong> the biological and the
          spiritual parent or guardian. Each is recorded with the date and the
          policy version in force.
        </p>

        <div className="mt-4 space-y-4">
          {CONSENT_ORDER.map((type) => {
            const record = given.get(type);
            return (
              <div key={type} className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-ink">{CONSENT_LABELS[type]}</h3>
                  {record ? (
                    <StatusChip tone="success">recorded</StatusChip>
                  ) : (
                    <StatusChip tone="progress">needed</StatusChip>
                  )}
                </div>

                {record ? (
                  <p className="mt-2 text-sm text-ink-soft">
                    Given on {fmt(record.grantedAt)} · policy {record.policyVersion}
                  </p>
                ) : (
                  <form action={recordConsentAction} className="mt-3">
                    <input type="hidden" name="applicationId" value={app.id} />
                    <input type="hidden" name="consentType" value={type} />
                    <label className="flex items-start gap-3 text-sm text-ink">
                      <input
                        type="checkbox"
                        name="agree"
                        required
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-forest)]"
                      />
                      <span>
                        I confirm the {CONSENT_LABELS[type].toLowerCase()} consents to this
                        application under the Organisational Policy &amp; Code of Conduct
                        (version {CURRENT_POLICY_VERSION}).
                      </span>
                    </label>
                    <button
                      type="submit"
                      className="mt-3 rounded-[var(--radius)] bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      Record this consent
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* IHF Letter */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-forest">IHF Letter</h2>
        <p className="mt-1 text-sm text-ink-soft">
          A PDF letter addressed to the public school and the parent or guardian.
        </p>
        {bothConsented ? (
          <a
            href={`/app/apply/${app.id}/letter`}
            className="mt-3 inline-flex rounded-[var(--radius)] border border-forest px-4 py-2 text-sm font-medium text-forest hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Download IHF Letter (PDF)
          </a>
        ) : (
          <p className="mt-3 rounded-[var(--radius)] border border-dashed border-cream-200 bg-cream/40 px-4 py-3 text-sm text-ink-soft">
            Available once both consents are recorded.
          </p>
        )}
      </section>
    </div>
  );
}
