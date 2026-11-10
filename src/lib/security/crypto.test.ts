import { describe, it, expect, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";
import { encryptField, decryptField, encryptOptional, _setKeyForTest } from "./crypto";

beforeAll(() => {
  _setKeyForTest(randomBytes(32));
});

describe("field encryption", () => {
  it("round-trips a value", () => {
    const token = encryptField("Ada Obi");
    expect(token.startsWith("v1:")).toBe(true);
    expect(decryptField(token)).toBe("Ada Obi");
  });

  it("produces different ciphertext each time (random IV)", () => {
    expect(encryptField("same")).not.toBe(encryptField("same"));
  });

  it("does not contain the plaintext", () => {
    const token = encryptField("St Mary's School");
    expect(token).not.toContain("Mary");
  });

  it("fails closed when the ciphertext is tampered with", () => {
    const token = encryptField("2015-04-01");
    const [, payload] = token.split(":");
    const bytes = Buffer.from(payload, "base64");
    bytes[bytes.length - 1] ^= 0x01; // flip a bit in the ciphertext
    const tampered = `v1:${bytes.toString("base64")}`;
    expect(() => decryptField(tampered)).toThrow();
  });

  it("rejects an unknown version", () => {
    expect(() => decryptField("v2:abc")).toThrow(/unsupported/);
  });

  it("encryptOptional returns null for empty/nullish", () => {
    expect(encryptOptional(null)).toBeNull();
    expect(encryptOptional("")).toBeNull();
    expect(encryptOptional(undefined)).toBeNull();
    expect(decryptField(encryptOptional("x")!)).toBe("x");
  });
});
