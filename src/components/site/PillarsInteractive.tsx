"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { PILLARS } from "@/lib/content/pillars";
import { Eyebrow, SectionTitle } from "@/components/site/primitives";
import { cn } from "@/lib/cn";

export function PillarsInteractive() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillar = PILLARS[active];

  // Arrow-key navigation for the vertical tablist (WCAG).
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % PILLARS.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + PILLARS.length) % PILLARS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = PILLARS.length - 1;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <Eyebrow>The five core pillars</Eyebrow>
        <SectionTitle>Biblical principles that guide everyday decisions.</SectionTitle>

        <div
          role="tablist"
          aria-label="The five core pillars"
          aria-orientation="vertical"
          className="mt-8 border-y border-cream-200"
        >
          {PILLARS.map((p, i) => {
            const selected = i === active;
            return (
              <button
                key={p.n}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`pillar-tab-${i}`}
                aria-selected={selected}
                aria-controls="pillar-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="flex w-full items-center gap-4 border-b border-cream-200 py-4 text-left transition-colors last:border-b-0"
              >
                <span className={cn("text-xs font-semibold", selected ? "text-gold" : "text-ink-soft/60")}>
                  {p.n}
                </span>
                <span
                  className={cn(
                    "text-xl font-semibold transition-colors sm:text-2xl",
                    selected ? "text-forest" : "text-ink-soft/50 hover:text-ink-soft",
                  )}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        <Link href="/pillars" className="mt-6 inline-block text-sm font-semibold text-forest hover:underline">
          Reflect on all five pillars →
        </Link>
      </div>

      <div
        role="tabpanel"
        id="pillar-panel"
        aria-labelledby={`pillar-tab-${active}`}
        className="rounded-[var(--radius-lg)] bg-cream-100 p-8"
      >
        {/* key re-mounts on change so the fade re-triggers (disabled under reduced-motion). */}
        <div key={active} className="animate-fade">
          <blockquote className="font-display text-xl leading-relaxed text-forest sm:text-2xl">
            “{pillar.verse}”
          </blockquote>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-gold">
            {pillar.reference}
          </p>
          <div className="mt-6 grid gap-4 border-t border-cream-200 pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">What it means</h3>
              <p className="mt-1 text-sm text-ink">{pillar.meaning}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">In daily life</h3>
              <p className="mt-1 text-sm text-ink">{pillar.apply}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
