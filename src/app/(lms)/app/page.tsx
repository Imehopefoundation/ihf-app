import type { Metadata } from "next";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfileName } from "@/lib/data/profile";
import { LMS_NAV } from "@/components/lms/nav";
import { LmsHero } from "@/components/lms/LmsHero";
import { SectionCard } from "@/components/lms/SectionCard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function LmsDashboard() {
  const { user, roles } = await requireSessionUser("/app");
  const isAdmin = roles.includes("admin");
  const supabase = await createClient();
  const name = await getProfileName(supabase, user.id);

  const cards = LMS_NAV.filter(
    (i) => i.href !== "/app" && (!i.roles || isAdmin || i.roles.some((r) => roles.includes(r))),
  );

  const roleLabel =
    roles.length > 0 ? roles.map((r) => r.replace(/_/g, " ")).join(", ") : "member";

  return (
    <div className="mx-auto max-w-4xl">
      <LmsHero
        eyebrow="Welcome back"
        title={name ? `Welcome, ${name}` : "Welcome back"}
        subtitle={`You're signed in as ${roleLabel}.${name ? "" : " Add your name in Account."} What you receive, you pass on.`}
        scripture="But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."
        reference="Matthew 6:33 (KJV)"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <SectionCard key={c.href} href={c.href} label={c.label} blurb={c.blurb} icon={c.icon} />
        ))}
      </div>
    </div>
  );
}
