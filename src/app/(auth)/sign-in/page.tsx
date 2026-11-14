import type { Metadata } from "next";
import { CredentialsForm } from "../CredentialsForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to the IHF LMS.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && (next === "/app" || next.startsWith("/app/")) ? next : undefined;

  return (
    <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
      <h1 className="text-2xl font-semibold text-forest">Welcome back</h1>
      <p className="mt-2 mb-6 text-sm text-ink-soft">Sign in to your IHF account.</p>
      <CredentialsForm mode="signin" next={safeNext} />
    </div>
  );
}
