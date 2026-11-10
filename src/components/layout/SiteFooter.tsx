import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { href: "/about", label: "About IHF" },
      { href: "/programmes", label: "Programmes" },
      { href: "/mentors", label: "Mentors" },
      { href: "/pillars", label: "Core Pillars" },
      { href: "/impact", label: "Our Impact" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { href: "/join", label: "Join Us" },
      { href: "/give", label: "Give" },
      { href: "/auth", label: "Log in" },
      { href: "/contact", label: "Contact and FAQ" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { href: "/contact", label: "Send us a message" },
      { href: "/safeguarding", label: "Safeguarding & Policies" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-night text-cream/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            Financial competence, Faith and Technical competence — raising
            empowered individuals who in turn raise others, across Africa.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-soft">
              {col.heading}
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-cream/80 hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-cream/60">
          © {year} IME HOPE FOUNDATION. All rights reserved. A God-centred
          charity serving communities across Africa.
        </div>
      </div>
    </footer>
  );
}
