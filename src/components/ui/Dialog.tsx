"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Accessible modal built on the native <dialog> element: focus trapping, Esc to
 * close and backdrop semantics come for free, with minimal JavaScript.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[min(32rem,92vw)] rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="dialog-title" className="text-lg font-semibold text-forest">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded p-1 text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-forest"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="mt-3 text-sm text-ink">{children}</div>
    </dialog>
  );
}
