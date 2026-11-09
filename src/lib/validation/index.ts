/**
 * Server-side input validation helpers built on Zod.
 *
 * CLAUDE.md: "Validate every input server-side with Zod: types, lengths, enums,
 * file metadata. Never trust client validation." Always validate at the trust
 * boundary (Route Handlers, Server Actions) before the data touches anything.
 */
import { z } from "zod";

/** Result of a safe validation: either typed data or a flat field-error map. */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

/**
 * Validate unknown input against a schema without throwing.
 * Returns a serialisable error map suitable for returning to a form — it never
 * leaks internal details or the raw input back to the caller.
 */
export function validate<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  return { success: false, errors: flattenZodErrors(parsed.error) };
}

/**
 * Validate or throw a generic error. Use where a failure is "impossible" (a
 * programming error) rather than user input — the message carries no payload.
 */
export function validateOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Validation failed");
  }
  return parsed.data;
}

function flattenZodErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Common primitives — bounded by default (assume every input hostile). */
/* ------------------------------------------------------------------ */

/** A trimmed, non-empty, length-bounded string. */
export const boundedString = (max = 500, min = 1) =>
  z.string().trim().min(min, "Required").max(max, `Must be ${max} characters or fewer`);

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254) // RFC 5321
  .pipe(z.email("Enter a valid email address"));

export const uuid = z.uuid("Invalid identifier");

/** Free-text message body for public forms (e.g. Contact). */
export const messageBody = boundedString(5000, 1);

/** A person's display name — bounded, no control characters. */
export const personName = z
  .string()
  .trim()
  .min(1, "Required")
  .max(120)
  .regex(/^[^\u0000-\u001f\u007f]+$/, "Contains invalid characters");

export { z };
