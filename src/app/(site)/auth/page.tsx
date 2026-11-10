import type { Metadata } from "next";
import { Section } from "@/components/site/primitives";
import { Field, Input } from "@/components/ui/Field";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your IHF account.",
};

export default function AuthPage() {
  return (
    <Section tone="cream" className="pt-16">
      <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-forest">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Sign in to your IHF account.
        </p>

        <div
          role="note"
          className="mt-5 rounded-[var(--radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Secure sign-in is being set up with managed authentication (email
          verification, password reset, and two-factor for staff). It opens once
          member accounts are enabled.
        </div>

        {/* Preview of the sign-in form. Disabled until managed auth is wired so
            no credentials are collected by a form that cannot yet protect them. */}
        <form className="mt-6 space-y-4">
          <Field label="Email address">
            {({ id }) => <Input id={id} type="email" autoComplete="email" disabled />}
          </Field>
          <Field label="Password">
            {({ id }) => <Input id={id} type="password" autoComplete="current-password" disabled />}
          </Field>
          <button
            type="button"
            disabled
            className="h-11 w-full rounded-[var(--radius)] bg-forest px-5 text-sm font-medium text-cream opacity-50"
          >
            Log in
          </button>
        </form>
      </div>
    </Section>
  );
}
