"use client";

import { useActionState } from "react";
import { subscribeSupporter, type FormState } from "@/app/(site)/contact/actions";
import { Field, Input, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: FormState = { status: "idle" };

export function SupporterSignup() {
  const [state, action, pending] = useActionState(subscribeSupporter, initial);

  return (
    <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
      <h2 className="font-semibold text-forest">Stay in touch</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Occasional updates about IHF&apos;s work. We keep our supporter list
        private, and every email has a one-click unsubscribe.
      </p>

      {state.status === "success" ? (
        <p role="status" className="mt-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {state.message}
        </p>
      ) : (
        <form action={action} className="mt-4 space-y-4" noValidate>
          {state.status === "error" && state.message && (
            <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {state.message}
            </p>
          )}
          <Field label="Your name" error={state.fieldErrors?.name?.[0]}>
            {({ id, describedBy }) => (
              <Input id={id} name="name" autoComplete="name" aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Email address" required error={state.fieldErrors?.email?.[0]}>
            {({ id, describedBy }) => (
              <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} />
            )}
          </Field>
          <Checkbox name="optIn" label="Yes, I'd like to receive occasional updates from IHF by email." />
          {state.fieldErrors?.optIn?.[0] && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {state.fieldErrors.optIn[0]}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing up…" : "Sign up"}
          </Button>
        </form>
      )}
    </div>
  );
}
