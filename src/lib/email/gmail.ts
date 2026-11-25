import "server-only";
import { emailEnv } from "@/lib/env";
import { buildRawMessage, EmailError, type EmailMessage } from "./message";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}
let cached: CachedToken | null = null;

/**
 * Exchange the long-lived refresh token for a short-lived access token. Cached
 * in memory until shortly before expiry. The refresh token and client secret
 * never leave the server and are never logged.
 */
async function getAccessToken(): Promise<string> {
  const env = emailEnv();
  if (!env) throw new EmailError("Email is not configured.");

  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    // Do not include the response body — it may echo token material.
    throw new EmailError(`OAuth token exchange failed (${res.status}).`);
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new EmailError("OAuth token exchange returned no token.");

  cached = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3000) * 1000,
  };
  return cached.token;
}

/** Send one message through the Gmail API as the configured sender. */
export async function gmailSend(msg: EmailMessage): Promise<void> {
  const env = emailEnv();
  if (!env) throw new EmailError("Email is not configured.");

  const raw = buildRawMessage(msg, env.GMAIL_SENDER);
  const token = await getAccessToken();

  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new EmailError(`Gmail send failed (${res.status}).`);
  }
}
