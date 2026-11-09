"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "info" | "success" | "error";
interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<{ notify: (message: string, tone?: ToastTone) => void } | null>(
  null,
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Announced to assistive tech; polite so it doesn't interrupt. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-[var(--radius)] border px-4 py-2.5 text-sm shadow-sm",
              t.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
              t.tone === "error" && "border-red-200 bg-red-50 text-red-900",
              t.tone === "info" && "border-cream-200 bg-white text-ink",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
