import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full rounded-[var(--radius)] border border-cream-200 bg-white px-3 py-2 text-base text-ink " +
  "placeholder:text-ink-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-forest aria-[invalid=true]:border-red-600";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}

/** Labelled form control with hint + error wiring (WCAG 2.2 AA). */
export function Field({ label, hint, error, required, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {children({ id, describedBy })}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlBase, "pr-8", className)} {...props} />;
}

export function Checkbox({
  label,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const generated = useId();
  const checkboxId = id ?? generated;
  return (
    <div className="flex items-start gap-2">
      <input
        id={checkboxId}
        type="checkbox"
        className={cn("mt-1 h-4 w-4 accent-[var(--color-forest)]", className)}
        {...props}
      />
      <label htmlFor={checkboxId} className="text-sm text-ink">
        {label}
      </label>
    </div>
  );
}
