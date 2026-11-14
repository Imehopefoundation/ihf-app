import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ComingSoon } from "@/components/lms/ComingSoon";

export const metadata: Metadata = { title: "Review queue" };

export default async function ReviewPage() {
  await requireRole(["programme_lead", "quality_assurance"]);
  return (
    <ComingSoon
      title="Review queue"
      blurb="Applications moving through submitted → under review → vetted → paired/waitlisted → accepted/declined, and assessments awaiting QA review before release."
    />
  );
}
