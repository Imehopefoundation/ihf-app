import "server-only";
import { emailEnv } from "@/lib/env";
import { logger } from "@/lib/logging/logger";
import { gmailSend } from "./gmail";
import type { EmailMessage } from "./message";

export interface Mailer {
  /** True when a real transport is configured; false for the dev no-op. */
  readonly live: boolean;
  send(msg: EmailMessage): Promise<void>;
}

const gmailMailer: Mailer = {
  live: true,
  async send(msg) {
    await gmailSend(msg);
  },
};

/**
 * Dev / unconfigured mailer: never sends, never logs PII (no recipient, no
 * body) — only that a send was skipped and the message kind-less subject shape.
 */
const devMailer: Mailer = {
  live: false,
  async send() {
    logger.info("email_skipped_not_configured", {});
  },
};

/** The active mailer: Gmail when configured, otherwise a safe no-op. */
export function getMailer(): Mailer {
  return emailEnv() ? gmailMailer : devMailer;
}
