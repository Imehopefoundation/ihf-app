import "server-only";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const MAX_SUBJECT = 200;
const MAX_BODY = 50_000;
// Conservative email address shape; we only ever send to addresses we control
// (auth.users), but validate anyway — defence in depth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailError extends Error {}

/**
 * Strip anything that could inject extra headers (CR/LF and NUL). Header values
 * must be a single line — this is the core defence against header injection in
 * To/Subject (CLAUDE.md: "Sanitise anything placed in headers or subjects").
 */
function headerSafe(value: string): string {
  return value.replace(/[\r\n\0]/g, " ").trim();
}

/** RFC 2047 encode a subject so non-ASCII can't smuggle control bytes. */
function encodeSubject(subject: string): string {
  const clean = headerSafe(subject).slice(0, MAX_SUBJECT);
  if (/^[\x20-\x7E]*$/.test(clean)) return clean; // plain ASCII, no encoding needed
  const b64 = Buffer.from(clean, "utf8").toString("base64");
  return `=?UTF-8?B?${b64}?=`;
}

export function base64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Build a raw RFC 822 message, base64url-encoded for the Gmail API
 * `users.messages.send` endpoint. `from` is the validated sender address.
 */
export function buildRawMessage(msg: EmailMessage, from: string): string {
  const to = headerSafe(msg.to);
  if (!EMAIL_RE.test(to)) throw new EmailError("Invalid recipient address.");
  if (!EMAIL_RE.test(from)) throw new EmailError("Invalid sender address.");

  const text = msg.text.slice(0, MAX_BODY);
  const html = msg.html?.slice(0, MAX_BODY);
  const subject = encodeSubject(msg.subject);

  const headersBase = [
    `From: ${headerSafe(from)}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
  ];

  let mime: string;
  if (html) {
    const boundary = `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    mime = [
      ...headersBase,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(text, "utf8").toString("base64"),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(html, "utf8").toString("base64"),
      `--${boundary}--`,
      "",
    ].join("\r\n");
  } else {
    mime = [
      ...headersBase,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(text, "utf8").toString("base64"),
      "",
    ].join("\r\n");
  }

  return base64Url(mime);
}
