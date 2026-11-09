import { describe, it, expect } from "vitest";
import { validate, email, personName, boundedString, z } from "./index";

describe("validate", () => {
  const schema = z.object({ name: personName, email });

  it("returns typed data on success and normalises it", () => {
    const result = validate(schema, { name: "  Ada  ", email: "ADA@Example.COM " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ada");
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("returns a flat field-error map on failure", () => {
    const result = validate(schema, { name: "", email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
    }
  });

  it("rejects over-long input", () => {
    const result = validate(z.object({ msg: boundedString(10) }), { msg: "x".repeat(11) });
    expect(result.success).toBe(false);
  });

  it("rejects control characters in names", () => {
    const result = validate(z.object({ name: personName }), { name: "Ada\u0007" });
    expect(result.success).toBe(false);
  });
});
