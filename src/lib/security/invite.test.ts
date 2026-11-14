import { describe, it, expect, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";
import { _setKeyForTest } from "./crypto";
import { createInviteToken, verifyInviteToken } from "./invite";

beforeAll(() => {
  _setKeyForTest(randomBytes(32));
});

describe("invite tokens", () => {
  it("round-trips a valid token and normalises the email", () => {
    const token = createInviteToken("Person@Example.COM");
    const payload = verifyInviteToken(token);
    expect(payload?.email).toBe("person@example.com");
    expect(payload?.exp).toBeGreaterThan(Date.now());
  });

  it("rejects a tampered signature", () => {
    const token = createInviteToken("a@b.com");
    const [body] = token.split(".");
    expect(verifyInviteToken(`${body}.AAAA`)).toBeNull();
  });

  it("rejects a body swapped under a stolen signature", () => {
    const token = createInviteToken("a@b.com");
    const sig = token.split(".")[1];
    const forgedBody = Buffer.from(
      JSON.stringify({ email: "attacker@evil.com", exp: Date.now() + 100000 }),
    ).toString("base64url");
    expect(verifyInviteToken(`${forgedBody}.${sig}`)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyInviteToken("")).toBeNull();
    expect(verifyInviteToken("nope")).toBeNull();
    expect(verifyInviteToken("a.b.c")).toBeNull();
  });

  it("rejects an expired token", () => {
    const expired = createInviteToken("a@b.com", -1);
    expect(verifyInviteToken(expired)).toBeNull();
  });
});
