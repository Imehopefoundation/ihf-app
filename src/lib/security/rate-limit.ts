/**
 * Rate limiting.
 *
 * CLAUDE.md: "Rate limit and lock out login, reset, invite and OTP endpoints"
 * and "per-IP and per-account rate limits" on public forms.
 *
 * This is an in-memory fixed-window limiter. It is correct for a single
 * instance and is used as the default in development and tests. In production
 * (multiple serverless instances) it MUST be backed by a shared store so limits
 * are enforced globally — see OPEN_ITEMS.md / SECURITY.md. The `RateLimiter`
 * interface lets us swap the backing store without touching call sites.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window (never negative). */
  remaining: number;
  /** Unix epoch ms when the current window resets. */
  resetAt: number;
  /** The configured ceiling. */
  limit: number;
}

export interface RateLimitOptions {
  /** Max requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimiter {
  check(key: string, options: RateLimitOptions): RateLimitResult;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  check(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    const allowed = bucket.count <= limit;
    const remaining = Math.max(0, limit - bucket.count);
    return { allowed, remaining, resetAt: bucket.resetAt, limit };
  }

  /** Remove expired buckets. Call periodically if the process is long-lived. */
  sweep(now = Date.now()): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }

  /** Test helper. */
  reset(): void {
    this.buckets.clear();
  }
}

/** Process-wide default limiter. Replace the backing store in production. */
export const defaultRateLimiter: RateLimiter = new InMemoryRateLimiter();

/** Sensible presets (tune per endpoint as phases add them). */
export const RATE_LIMITS = {
  /** Auth-sensitive endpoints: login, password reset, invite, OTP. */
  auth: { limit: 5, windowMs: 60_000 },
  /** Public form submissions (Contact, supporter sign-up). */
  publicForm: { limit: 3, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitOptions>;
