import "server-only";
import type { EmailMessage } from "./message";

/** Escape user-influenced text before putting it in an HTML body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function prettyDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shell(bodyHtml: string): string {
  // Minimal, inline-styled, monochrome. No tracking pixels, no remote images.
  return `<!doctype html><html><body style="margin:0;background:#ffffff;color:#343434;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#878787;margin:0 0 16px">IME HOPE FOUNDATION</p>
${bodyHtml}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0"/>
<p style="font-size:13px;color:#878787;margin:0">You receive this because you are part of IME HOPE FOUNDATION. For your safety, we never include personal details in email — sign in to see them.</p>
</div></body></html>`;
}

/**
 * A reminder that a class is coming up. Carries NO personal data — only the
 * class title and date (operational, not personal) and a link that requires
 * login (CLAUDE.md: "No sensitive data in email bodies; use links that require
 * login").
 */
export function classReminder(opts: {
  title: string;
  date: string;
  loginUrl: string;
}): Omit<EmailMessage, "to"> {
  const when = prettyDate(opts.date);
  const subject = "Reminder: an upcoming class";

  const text = [
    `You have a class coming up:`,
    ``,
    `  ${opts.title}`,
    `  ${when}`,
    ``,
    `Sign in to see the details and times:`,
    opts.loginUrl,
    ``,
    `"What you receive, you pass on."`,
  ].join("\n");

  const html = shell(
    `<h1 style="font-size:20px;color:#343434;margin:0 0 8px">You have a class coming up</h1>
<p style="margin:0 0 4px"><strong>${esc(opts.title)}</strong></p>
<p style="margin:0 0 24px;color:#878787">${esc(when)}</p>
<p style="margin:0 0 24px"><a href="${esc(opts.loginUrl)}" style="display:inline-block;background:#8B6B3E;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Sign in to see details</a></p>
<p style="margin:0;color:#878787;font-style:italic">&ldquo;What you receive, you pass on.&rdquo;</p>`,
  );

  return { subject, text, html };
}
