import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { InviteForm } from "./InviteForm";

export const metadata: Metadata = { title: "Invitations" };

export default async function InvitationsPage() {
  await requireRole(["admin"]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Invitations</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Accounts are by invitation only. Create a secure link for someone&apos;s
        email address and send it to them — they use it to set up their account.
        Links expire after 7 days and can create only the invited address.
      </p>
      <div className="mt-8 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
        <InviteForm />
      </div>
    </div>
  );
}
