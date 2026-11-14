"use client";

import { useActionState, useState } from "react";
import { generateInviteAction, type InviteState } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: InviteState = { status: "idle" };

export function InviteForm() {
  const [state, action, pending] = useActionState(generateInviteAction, initial);
  const [copied, setCopied] = useState(false);

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-4" noValidate>
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {state.message}
          </p>
        )}
        <Field label="Invite email address" required>
          {({ id }) => <Input id={id} name="email" type="email" autoComplete="off" required />}
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create invite link"}
        </Button>
      </form>

      {state.status === "ok" && state.link && (
        <div role="status" className="rounded-[var(--radius-lg)] border border-cream-200 bg-cream/50 p-4">
          <p className="text-sm font-medium text-ink">
            Invite link for <span className="break-all">{state.email}</span>
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Valid for 7 days, single-use. Send it to the invited person&apos;s email.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-[var(--radius)] border border-cream-200 bg-white px-3 py-2 text-xs text-ink">
              {state.link}
            </code>
            <button
              type="button"
              onClick={() => copy(state.link!)}
              className="rounded-[var(--radius)] border border-cream-200 px-3 py-2 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
