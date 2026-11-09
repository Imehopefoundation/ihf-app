/**
 * Structured logger that scrubs PII before anything is emitted.
 *
 * CLAUDE.md: "Structured logs with NO PII, tokens or child data." This logger
 * redacts known-sensitive keys and obvious secrets/emails in values, at any
 * nesting depth, so a careless `logger.info("x", someRecord)` cannot leak a
 * child's name, a guardian's phone or an auth token. It is defence-in-depth,
 * NOT a licence to pass sensitive objects — prefer logging ids and events.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

/** Keys whose values are always redacted (case-insensitive, substring match). */
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "pass",
  "secret",
  "token",
  "authorization",
  "auth",
  "cookie",
  "session",
  "apikey",
  "api_key",
  "key",
  "ssn",
  "dob",
  "dateofbirth",
  "date_of_birth",
  "email",
  "phone",
  "mobile",
  "whatsapp",
  "address",
  "name",
  "firstname",
  "lastname",
  "fullname",
  "guardian",
  "child",
  "school",
  "health",
  "welfare",
  "note",
  "notes",
];

const REDACTED = "[REDACTED]";
const MAX_DEPTH = 6;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Long opaque strings that look like tokens/JWTs.
const TOKEN_RE = /\b(?:eyJ[A-Za-z0-9_-]{10,}|[A-Za-z0-9_-]{32,})\b/g;

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((p) => k.includes(p));
}

function scrubString(value: string): string {
  return value.replace(EMAIL_RE, REDACTED).replace(TOKEN_RE, REDACTED);
}

/** Recursively redact sensitive keys and secret-looking values. */
export function scrub(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return REDACTED;
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) {
    return { name: value.name, message: scrubString(value.message) };
  }
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = isSensitiveKey(k) ? REDACTED : scrub(v, depth + 1);
    }
    return out;
  }
  // functions, symbols, bigint, etc.
  return REDACTED;
}

export interface Logger {
  debug(event: string, data?: Record<string, unknown>): void;
  info(event: string, data?: Record<string, unknown>): void;
  warn(event: string, data?: Record<string, unknown>): void;
  error(event: string, data?: Record<string, unknown>): void;
}

function emit(level: LogLevel, event: string, data?: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    ...(data ? { data: scrub(data) } : {}),
  });
  // Single structured line per event. Routed to the platform collector in prod.
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(line);
}

export const logger: Logger = {
  debug: (event, data) => {
    if (process.env.NODE_ENV !== "production") emit("debug", event, data);
  },
  info: (event, data) => emit("info", event, data),
  warn: (event, data) => emit("warn", event, data),
  error: (event, data) => emit("error", event, data),
};
