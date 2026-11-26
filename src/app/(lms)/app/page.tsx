import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/session";
import { homeForRoles } from "@/lib/auth/area";

/**
 * The LMS entry point is a router, not a shared dashboard: each person is sent
 * to their own area's home — mentees, mentors and admins never land on the same
 * screen. The onboarding name gate (in the layout) runs first.
 */
export default async function LmsEntry() {
  const { roles } = await requireSessionUser("/app");
  redirect(homeForRoles(roles));
}
