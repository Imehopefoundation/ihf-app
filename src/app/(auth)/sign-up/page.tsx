import type { Metadata } from "next";
import { CredentialsForm } from "../CredentialsForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your IHF account.",
};

export default function SignUpPage() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
      <h1 className="text-2xl font-semibold text-forest">Create your account</h1>
      <p className="mt-2 mb-6 text-sm text-ink-soft">
        Sign up with your email so you can save progress and return at any time.
      </p>
      <CredentialsForm mode="signup" />
    </div>
  );
}
