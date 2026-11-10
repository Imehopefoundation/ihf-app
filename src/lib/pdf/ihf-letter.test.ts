import { describe, it, expect } from "vitest";
import { clean, generateIhfLetter } from "./ihf-letter";

describe("clean", () => {
  it("strips control characters and length-limits", () => {
    expect(clean("Ada\u0007\u0000 Obi", 50)).toBe("Ada Obi");
    expect(clean("x".repeat(100), 10)).toHaveLength(10);
  });

  it("removes characters the PDF font cannot encode", () => {
    const out = clean("Ada 😀 Obi", 50); // emoji
    expect(out).not.toContain("\uD83D");
    expect(out).toContain("Ada");
  });
});

describe("generateIhfLetter", () => {
  it("produces a valid PDF", async () => {
    const bytes = await generateIhfLetter({
      applicationRef: "IHF-2026-0001",
      childName: "Ada Obi",
      guardianName: "Jane Obi",
      schoolName: "St Mary's Public School",
      programme: "Skills Development",
    });
    const header = Buffer.from(bytes.slice(0, 5)).toString("latin1");
    expect(header).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(500);
  });

  it("does not throw on hostile / oversized input", async () => {
    const bytes = await generateIhfLetter({
      applicationRef: "\u0000".repeat(10) + "x".repeat(500),
      childName: "<script>alert(1)</script>" + "y".repeat(500),
      guardianName: "💥".repeat(100),
      schoolName: "\n\n\t".repeat(50) + "School",
      programme: "z".repeat(500),
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString("latin1")).toBe("%PDF-");
  });
});
