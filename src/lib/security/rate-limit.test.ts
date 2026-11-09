import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { InMemoryRateLimiter } from "./rate-limit";

describe("InMemoryRateLimiter", () => {
  let limiter: InMemoryRateLimiter;
  const opts = { limit: 3, windowMs: 1000 };

  beforeEach(() => {
    limiter = new InMemoryRateLimiter();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit then blocks", () => {
    expect(limiter.check("ip:1", opts).allowed).toBe(true);
    expect(limiter.check("ip:1", opts).allowed).toBe(true);
    expect(limiter.check("ip:1", opts).allowed).toBe(true);
    const blocked = limiter.check("ip:1", opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks keys independently", () => {
    limiter.check("ip:1", opts);
    limiter.check("ip:1", opts);
    limiter.check("ip:1", opts);
    expect(limiter.check("ip:2", opts).allowed).toBe(true);
  });

  it("resets after the window elapses", () => {
    for (let i = 0; i < 3; i++) limiter.check("ip:1", opts);
    expect(limiter.check("ip:1", opts).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(limiter.check("ip:1", opts).allowed).toBe(true);
  });
});
