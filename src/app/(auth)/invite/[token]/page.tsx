import type { Metadata } from "next";
import Link from "next/link";
import { verifyInviteToken } from "@/lib/security/invite";
import { CredentialsForm } from "../../CredentialsForm";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = verifyInviteToken(decodeURIComponent(token));

  if (!invite) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-forest">This invitation link isn&apos;t valid</h1>
        <p className="mt-3 text-sm text-ink-soft">
          It may have expired or already been used. Please ask IHF for a new
          invitation.
        </p>
        <Link href="/sign-in" className="mt-6 inline-flex text-sm font-semibold text-forest hover:underline">
          Already have an account? Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
      <h1 className="text-2xl font-semibold text-forest">Set up your account</h1>
      <p className="mt-2 mb-6 text-sm text-ink-soft">
        You&apos;ve been invited to IHF. Choose a password to finish creating your account.
      </p>
      <CredentialsForm mode="signup" token={decodeURIComponent(token)} lockedEmail={invite.email} />
    </div>
  );
}
