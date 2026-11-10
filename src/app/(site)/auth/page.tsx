import type { Metadata } from "next";
import { Section } from "@/components/site/primitives";
import { CredentialsForm } from "./CredentialsForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your IHF account.",
};

export default function AuthPage() {
  return (
    <Section tone="cream" className="pt-16">
      <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-forest">Welcome back</h1>
        <p className="mt-2 mb-6 text-sm text-ink-soft">Sign in to your IHF account.</p>
        <CredentialsForm mode="signin" />
      </div>
    </Section>
  );
}
