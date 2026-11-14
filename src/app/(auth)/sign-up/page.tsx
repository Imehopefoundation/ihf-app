import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registration",
  description: "IHF accounts are by invitation only.",
};

export default function SignUpPage() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
      <h1 className="text-2xl font-semibold text-forest">Registration is by invitation</h1>
      <p className="mt-3 text-sm text-ink-soft">
        IHF accounts are created from a secure link we send to your email. If you
        have been invited, open the link in that email to set up your account.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        If you would like to take part, please{" "}
        <Link href="/contact" className="font-semibold text-forest hover:underline">
          get in touch
        </Link>{" "}
        and our team will be glad to help.
      </p>
      <Link
        href="/sign-in"
        className="mt-6 inline-flex text-sm font-semibold text-forest hover:underline"
      >
        Already have an account? Log in
      </Link>
    </div>
  );
}
