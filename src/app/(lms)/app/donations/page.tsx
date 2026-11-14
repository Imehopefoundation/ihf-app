import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ComingSoon } from "@/components/lms/ComingSoon";

export const metadata: Metadata = { title: "Donations" };

export default async function DonationsPage() {
  await requireRole(["finance"]);
  return (
    <ComingSoon
      title="Donations"
      blurb="Giving records and processor reconciliation. Private by default — no donor wall, no public amounts; only processor references are stored, never card data."
    />
  );
}
