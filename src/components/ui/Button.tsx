import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "gold" | "give";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium " +
  "transition-colors disabled:opacity-50 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-forest text-cream hover:bg-forest-deep focus-visible:outline-forest",
  secondary:
    "border border-forest text-forest hover:bg-forest/5 focus-visible:outline-forest",
  ghost: "text-forest hover:bg-cream-100 focus-visible:outline-forest",
  gold: "bg-gold text-night hover:bg-gold-soft focus-visible:outline-forest",
  // Give / donate — generous gold with dark text, reserved for giving actions.
  give: "bg-give text-night hover:bg-give-dark focus-visible:outline-forest",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Shared classes so links (<Link>) can look like buttons without duplication. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
