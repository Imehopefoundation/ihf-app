import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Semantic, responsive table primitives for dashboards (calm and dense). */
export function Table({
  caption,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableElement> & { caption?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-lg)] border border-cream-200">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-cream-200 bg-cream-100 px-4 py-2.5 font-semibold text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-cream-200 px-4 py-2.5 text-ink", className)} {...props} />;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-cream-200 bg-cream-100/60 px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <p className="mt-1 text-sm text-ink-soft">{children}</p>}
    </div>
  );
}
