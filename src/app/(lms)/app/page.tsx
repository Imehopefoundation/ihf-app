import type { Metadata } from "next";
import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/session";
import { LMS_NAV } from "@/components/lms/nav";

export const metadata: Metadata = { title: "Dashboard" };

export default async function LmsDashboard() {
  const { user, roles } = await requireSessionUser("/app");
  const isAdmin = roles.includes("admin");

  const cards = LMS_NAV.filter(
    (i) => i.href !== "/app" && (!i.roles || isAdmin || i.roles.some((r) => roles.includes(r))),
  );

  const roleLabel =
    roles.length > 0 ? roles.map((r) => r.replace(/_/g, " ")).join(", ") : "member";
  const isStaffless = roles.length === 0;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Welcome</p>
      <h1 className="mt-1 break-words text-2xl font-semibold text-ink">{user.email}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        You are signed in as <span className="text-ink">{roleLabel}</span>.
      </p>

      {isStaffless && (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-cream-200 bg-cream/50 p-5">
          <h2 className="font-semibold text-ink">New here?</h2>
          <p className="mt-1 text-sm text-ink-soft">
            To apply on behalf of a child, start by registering as a parent or
            guardian. Your details are encrypted and visible only to authorised
            IHF staff.
          </p>
          <Link
            href="/app/apply"
            className="mt-4 inline-flex rounded-[var(--radius)] bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Start an application
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-[var(--radius-lg)] border border-cream-200 bg-white p-5 transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <h2 className="font-semibold text-ink group-hover:text-forest">{c.label}</h2>
            {c.blurb && <p className="mt-1 text-sm text-ink-soft">{c.blurb}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
