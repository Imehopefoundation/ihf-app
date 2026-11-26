"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import type { LmsNavItem } from "./nav";
import { Icon } from "./icons";
import { signOut } from "@/app/(auth)/actions";

/**
 * The active item is the one whose href is the LONGEST prefix of the current
 * path, so on /app/learning/videos the "Videos" item is active, not "Dashboard".
 */
function activeHref(items: readonly LmsNavItem[], pathname: string): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.length) best = item.href;
    }
  }
  return best;
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: readonly LmsNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const current = activeHref(items, pathname);
  return (
    <nav aria-label="LMS" className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius)] border-l-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-gold bg-cream-100 font-semibold text-ink"
                : "border-transparent text-ink-soft hover:bg-cream-100 hover:text-ink",
            )}
          >
            <Icon name={item.icon} className={cn("h-[18px] w-[18px]", active ? "text-gold" : "text-ink-soft")} />
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
  items,
  children,
}: {
  email: string;
  items: readonly LmsNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
            <Link href="/app" aria-label="IHF LMS — dashboard" className="flex items-center gap-2.5">
              <Logo priority />
              <span aria-hidden="true" className="h-5 w-px bg-cream-200" />
              <span className="text-sm font-semibold uppercase tracking-widest text-ink">
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
