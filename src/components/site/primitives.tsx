import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "cream" | "white" | "forest" | "night";

const toneClass: Record<Tone, string> = {
  cream: "bg-cream text-ink",
  white: "bg-white text-ink",
  forest: "bg-forest-deep text-cream",
  night: "bg-night text-cream",
};

/** Full-bleed section band with a centered content container. */
export function Section({
  tone = "cream",
  className,
  containerClassName,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { tone?: Tone; containerClassName?: string }) {
  return (
    <section className={cn(toneClass[tone], "px-4 py-16 sm:py-20", className)} {...props}>
      <div className={cn("mx-auto max-w-6xl", containerClassName)}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <p className={cn("eyebrow", onDark && "text-gold-soft")}>{children}</p>
  );
}

export function SectionTitle({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl",
        onDark ? "text-cream" : "text-forest",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Lead({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("mt-4 max-w-2xl text-lg", onDark ? "text-cream/80" : "text-ink-soft", className)}>
      {children}
    </p>
  );
}

/** A KJV scripture block (CLAUDE.md: KJV only). */
export function Scripture({
  reference,
  onDark = false,
  children,
}: {
  reference: string;
  onDark?: boolean;
  children: ReactNode;
}) {
  return (
    <figure>
      <blockquote
        className={cn(
          "font-display text-xl leading-relaxed sm:text-2xl",
          onDark ? "text-cream" : "text-forest",
        )}
      >
        “{children}”
      </blockquote>
      <figcaption
        className={cn(
          "mt-3 text-xs font-semibold uppercase tracking-widest",
          onDark ? "text-gold-soft" : "text-gold",
        )}
      >
        {reference}
      </figcaption>
    </figure>
  );
}

/**
 * Neutral image placeholder. CLAUDE.md: real African youth/community photography
 * with documented consent only; neutral placeholders until assets arrive. No
 * stock photos of identifiable children.
 */
export function ImagePlaceholder({
  label,
  caption,
  className,
}: {
  label: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-end overflow-hidden rounded-[var(--radius-lg)] border border-cream-200 bg-cream-100",
        className,
      )}
      role="img"
      aria-label={caption ? `${label}. ${caption}` : label}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-ink-soft/60"
      >
        Image to come
      </div>
      {caption && (
        <div className="relative z-10 m-3 rounded-[var(--radius)] bg-white/90 px-3 py-2 text-xs">
          <span className="font-semibold text-forest">{label}</span>
          <span className="block text-ink-soft">{caption}</span>
        </div>
      )}
    </div>
  );
}
