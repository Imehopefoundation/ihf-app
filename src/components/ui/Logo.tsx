import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Brand logo. CLAUDE.md: black logo on light backgrounds, white logo on dark/
 * coloured backgrounds; never redraw or recolour. Uses the approved assets in
 * public/brand/ (currently PNG placeholders; swap for the official SVGs when
 * supplied — see docs/OPEN_ITEMS.md). Intrinsic ratio 600×168.
 */
export function Logo({
  onDark = false,
  className,
  priority = false,
}: {
  onDark?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const src = onDark ? "/brand/logo-white.png" : "/brand/logo-black.png";
  return (
    <Image
      src={src}
      alt="IME HOPE FOUNDATION"
      width={600}
      height={168}
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}
