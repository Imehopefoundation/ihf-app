import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ComingSoon } from "@/components/lms/ComingSoon";

export const metadata: Metadata = { title: "My learning" };

export default async function LearningPage() {
  await requireRole(["mentee"]);
  return (
    <ComingSoon
      title="My learning"
      blurb="Your sessions, monthly project assessments, post-assessment surveys, Impact Journal and attendance — all in one place."
    />
  );
}
