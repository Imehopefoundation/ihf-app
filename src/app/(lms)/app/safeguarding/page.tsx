import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ComingSoon } from "@/components/lms/ComingSoon";

export const metadata: Metadata = { title: "Safeguarding" };

export default async function SafeguardingInboxPage() {
  await requireRole(["safeguarding_officer"]);
  return (
    <ComingSoon
      title="Safeguarding"
      blurb="Confidential safeguarding reports route only to this role. Every staff view of a child record is written to the audit log."
    />
  );
}
