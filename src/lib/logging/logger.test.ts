import { describe, it, expect } from "vitest";
import { scrub } from "./logger";

describe("scrub", () => {
  it("redacts sensitive keys (whole subtree) at any depth", () => {
    const input = {
      userId: "abc",
      email: "child@example.com",
      guardian: { name: "Jane Doe", phone: "+2348012345678" },
      application: { child: { dob: "2015-01-01", school: "St Mary" } },
    };
    const out = scrub(input) as Record<string, unknown>;
    expect(out.userId).toBe("abc"); // non-sensitive kept
    expect(out.email).toBe("[REDACTED]");
    // A sensitive key redacts its entire value, not just leaf fields.
    expect(out.guardian).toBe("[REDACTED]");
    // Non-sensitive parent is traversed; the sensitive child key is redacted whole.
    const application = out.application as Record<string, unknown>;
    expect(application.child).toBe("[REDACTED]");
  });

  it("redacts emails and token-like strings found in free values", () => {
    const out = scrub({ note_text: "reach me at a.b@test.org" });
    // the key 'note_text' matches 'note' -> whole value redacted
    expect((out as Record<string, unknown>).note_text).toBe("[REDACTED]");

    const out2 = scrub({ detail: "contact a.b@test.org please" }) as Record<string, unknown>;
    expect(out2.detail).toBe("contact [REDACTED] please");

    const jwt = "eyJhbGciOiJIUzI1Nitest1234567890abcdef";
    const out3 = scrub({ detail: `token ${jwt}` }) as Record<string, unknown>;
    expect(out3.detail).toBe("token [REDACTED]");
  });

  it("handles Errors without leaking stack traces", () => {
    const out = scrub(new Error("boom a.b@test.org")) as Record<string, unknown>;
    expect(out.message).toBe("boom [REDACTED]");
    expect(out).not.toHaveProperty("stack");
  });
});
