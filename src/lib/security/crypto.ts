/**
 * Field-level encryption for sensitive child/guardian data.
 *
 * CLAUDE.md: "Sensitive child data (names, DOB, school, health or welfare notes,
 * guardian contacts) uses field-level encryption with keys held outside the
 * database. Never store plaintext copies."
 *
 * Authenticated encryption (AES-256-GCM). The key comes from the environment
 * (FIELD_ENCRYPTION_KEY) — i.e. outside the database — so a database dump or
 * backup contains only ciphertext. Tokens are versioned (`v1:…`) to allow key
 * rotation later. Decryption fails closed on any tampering (auth tag check).
 *
 * This is server-only; it must never be bundled for the browser.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

if (typeof window !== "undefined") {
  throw new Error("crypto helpers are server-only and must not run in the browser.");
}

const VERSION = "v1";
const IV_BYTES = 12;
const KEY_BYTES = 32;

let cachedKey: Buffer | null = null;

/** Load the 32-byte key from FIELD_ENCRYPTION_KEY (base64 or hex). Fails closed. */
function key(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) throw new Error("FIELD_ENCRYPTION_KEY is not set");
  let buf: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    buf = Buffer.from(raw, "hex");
  } else {
    buf = Buffer.from(raw, "base64");
  }
  if (buf.length !== KEY_BYTES) {
    throw new Error("FIELD_ENCRYPTION_KEY must decode to 32 bytes");
  }
  cachedKey = buf;
  return buf;
}

/** For tests: inject a key directly. */
export function _setKeyForTest(buf: Buffer): void {
  cachedKey = buf;
}

/**
 * Encrypt a UTF-8 string. Returns `v1:<base64(iv|tag|ciphertext)>`.
 * Each call uses a fresh random IV, so equal plaintexts produce different tokens.
 */
export function encryptField(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

/** Decrypt a token produced by encryptField. Throws on tampering or bad version. */
export function decryptField(token: string): string {
  const [version, payload] = token.split(":", 2);
  if (version !== VERSION || !payload) throw new Error("unsupported ciphertext");
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, IV_BYTES);
  const tag = raw.subarray(IV_BYTES, IV_BYTES + 16);
  const ct = raw.subarray(IV_BYTES + 16);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Encrypt only when a value is present, so optional fields stay null. */
export function encryptOptional(value: string | null | undefined): string | null {
  return value == null || value === "" ? null : encryptField(value);
}
