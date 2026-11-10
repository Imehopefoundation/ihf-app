"use client";

import { useState, type FormEvent } from "react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const CODE_RE = /^IHF-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export function MentorInviteForm() {
  const [error, setError] = useState<string>();
  const [accepted, setAccepted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    if (!CODE_RE.test(code)) {
      setError("Enter a valid invitation code in the form IHF-XXXX-XXXX.");
      setAccepted(false);
      return;
    }
    // Format is valid. Verifying the code against the invitation record and
    // opening mentor registration is part of the mentor onboarding release.
    setError(undefined);
    setAccepted(true);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
      <h3 className="font-semibold text-forest">Have an invitation code?</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Enter it to begin mentor registration.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <Field label="Invitation code" error={error}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              name="code"
              placeholder="e.g. IHF-XXXX-XXXX"
              autoComplete="off"
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
            />
          )}
        </Field>
        <Button type="submit">Continue</Button>
      </form>
      {accepted && (
        <p role="status" className="mt-4 text-sm font-medium text-forest">
          Thank you — your code looks valid. Mentor registration with this code
          opens in the next release; we&apos;ll be in touch.
        </p>
      )}
    </div>
  );
}
