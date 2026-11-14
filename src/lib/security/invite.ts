/**
 * Invitation links — registration is by invitation only (CLAUDE.md:
 * "Invitations are single-use and expiring").
 *
 * An invite is a signed, email-bound, expiring token. It is NOT a password: it
 * only authorises creating ONE account, for ONE email address, before an expiry.
 * The HMAC key is derived (domain-separated) from FIELD_ENCRYPTION_KEY, so no
 * new secret is needed and the raw encryption key is never used directly.
 *
 * Single-use: the token is bound to an email; once that email has registered,
 * the signup fails ("already registered"), so the link cannot create a second
 * account. (A stateless token cannot be revoked before expiry — for rev_ocable,
 * server-tracked invites we would add an invitations table; see OPEN_ITEMS.)
 *
 * Server-only — importing it pulls in crypto.ts, which throws if loaded in the
 * browser, so this module can never be bundled client-side either.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { deriveSubkey } from "@/lib/security/crypto";

const SIGNING_INFO = "ihf-invite-signing-v1";
const DEFAULT_TTL_DAYS = 7;

export interface InvitePayload {
  email: string;
  exp: number; // ms epoch
}

function sign(body: string): Buffer {
  return createHmac("sha256", deriveSubkey(SIGNING_INFO)).update(body).digest();
}

/** Create a signed invite token for an email, valid for `ttlDays`. */
export function createInviteToken(email: string, ttlDays = DEFAULT_TTL_DAYS): string {
  const payload: InvitePayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ttlDays * 86_400_000,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body).toString("base64url")}`;
}

/** Verify a token: returns the payload if the signature is valid and unexpired. */
export function verifyInviteToken(token: string): InvitePayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = sign(body);
  let provided: Buffer;
  try {
    provided = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  let payload: InvitePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
  if (Date.now() > payload.exp) return null;
  return payload;
}
