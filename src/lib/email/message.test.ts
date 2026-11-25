import { describe, it, expect } from "vitest";
import { buildRawMessage, base64Url, EmailError } from "./message";

const FROM = "imehopefoundation@gmail.com";

function decode(raw: string): string {
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

describe("buildRawMessage", () => {
  it("builds a base64url message with the expected headers", () => {
    const raw = buildRawMessage(
      { to: "member@example.com", subject: "Hello", text: "Hi there" },
      FROM,
    );
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/); // base64url, no padding/+//
    const mime = decode(raw);
    expect(mime).toContain(`From: ${FROM}`);
    expect(mime).toContain("To: member@example.com");
    expect(mime).toContain("Subject: Hello");
    expect(mime).toContain("MIME-Version: 1.0");
  });

  it("strips CR/LF from the subject (header injection defence)", () => {
    const raw = buildRawMessage(
      {
        to: "member@example.com",
        subject: "Hi\r\nBcc: victim@example.com\r\nX-Evil: 1",
        text: "body",
      },
      FROM,
    );
    const mime = decode(raw);
    // No NEW header line is created — the injected text collapses onto the
    // single Subject line (harmless as subject content, not a real header).
    expect(mime).not.toMatch(/\r\nBcc:/i);
    expect(mime).not.toMatch(/\r\nX-Evil:/i);
    expect(mime).toMatch(/Subject: Hi\s+Bcc: victim@example\.com\s+X-Evil: 1/);
  });

  it("strips CR/LF from the recipient", () => {
    expect(() =>
      buildRawMessage(
        { to: "ok@example.com\r\nBcc: victim@example.com", subject: "s", text: "b" },
        FROM,
      ),
    ).toThrow(EmailError);
  });

  it("rejects an invalid recipient", () => {
    expect(() => buildRawMessage({ to: "not-an-email", subject: "s", text: "b" }, FROM)).toThrow(
      EmailError,
    );
  });

  it("rejects an invalid sender", () => {
    expect(() => buildRawMessage({ to: "ok@example.com", subject: "s", text: "b" }, "nope")).toThrow(
      EmailError,
    );
  });

  it("MIME-encodes a non-ASCII subject", () => {
    const raw = buildRawMessage(
      { to: "member@example.com", subject: "Olá 🌍", text: "body" },
      FROM,
    );
    const mime = decode(raw);
    expect(mime).toMatch(/Subject: =\?UTF-8\?B\?/);
  });

  it("produces multipart/alternative when html is given", () => {
    const raw = buildRawMessage(
      { to: "member@example.com", subject: "s", text: "plain", html: "<p>rich</p>" },
      FROM,
    );
    const mime = decode(raw);
    expect(mime).toContain("multipart/alternative");
    expect(mime).toContain("text/plain");
    expect(mime).toContain("text/html");
  });
});

describe("base64Url", () => {
  it("is URL-safe and unpadded", () => {
    expect(base64Url("???>>>")).not.toMatch(/[+/=]/);
  });
});
