"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import type { AppRole } from "@/lib/auth/session";
import { LMS_NAV } from "./nav";
import { signOut } from "@/app/(auth)/actions";

function visible(roles: AppRole[]) {
  const isAdmin = roles.includes("admin");
  return LMS_NAV.filter((i) => !i.roles || isAdmin || i.roles.some((r) => roles.includes(r)));
}

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(href + "/");
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: typeof LMS_NAV;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="LMS" className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-[var(--radius)] border-l-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-gold bg-cream-100 font-semibold text-ink"
                : "border-transparent text-ink-soft hover:bg-cream-100 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Authenticated LMS shell: role-aware sidebar + top bar. Distinct from the
 *  public website chrome (SiteHeader/SiteFooter). */
export function LmsShell({
  email,
  roles,
  children,
}: {
  email: string;
  roles: AppRole[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = visible(roles);

  return (
    <div className="flex min-h-full flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-cream-200 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="lms-drawer"
              aria-label={open ? "Close menu" : "Open menu"}
              className="rounded p-2 text-ink lg:hidden focus-visible:outline-2 focus-visible:outline-forest"
            >
              <span aria-hidden="true">{open ? "✕" : "☰"}</span>
            </button>
            <Link href="/app" aria-label="IHF LMS — dashboard" className="flex items-center gap-2">
              <Logo priority />
              <span className="hidden text-xs font-semibold uppercase tracking-widest text-ink-soft sm:inline">
                LMS
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-ink-soft hover:text-ink sm:inline">
              View website
            </Link>
            <span className="hidden max-w-[16rem] truncate text-sm text-ink-soft md:inline" title={email}>
              {email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-[var(--radius)] border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-cream-200 p-4 lg:block">
          <NavList items={items} pathname={pathname} />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              id="lms-drawer"
              className="absolute left-0 top-0 h-full w-64 border-r border-cream-200 bg-white p-4 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded p-1 text-ink focus-visible:outline-2 focus-visible:outline-forest"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded px-3 py-2 text-sm text-ink-soft hover:bg-cream-100"
              >
                View website
              </Link>
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
