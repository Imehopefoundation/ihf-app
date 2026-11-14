"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/about", label: "About IHF" },
  { href: "/programmes", label: "Programmes" },
  { href: "/impact", label: "Our Impact" },
  { href: "/join", label: "Join Us" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="IME HOPE FOUNDATION — home" className="shrink-0">
          <Logo priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink hover:text-forest"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/sign-in" className={buttonClasses("ghost", "sm")}>
            Log in
          </Link>
          <Link href="/join" className={buttonClasses("primary", "sm")}>
            Apply
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded p-2 text-forest lg:hidden focus-visible:outline-2 focus-visible:outline-forest"
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-cream-200 bg-cream px-4 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-2 py-2 text-base font-medium text-ink hover:bg-cream-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className={cn(buttonClasses("secondary", "md"), "flex-1")}
            >
              Log in
            </Link>
            <Link
              href="/join"
              onClick={() => setOpen(false)}
              className={cn(buttonClasses("primary", "md"), "flex-1")}
            >
              Apply
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
