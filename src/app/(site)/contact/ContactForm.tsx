"use client";

import { useActionState } from "react";
import { submitContact, CONTACT_TOPICS, type FormState } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: FormState = { status: "idle" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      <Field label="Your name" required error={state.fieldErrors?.name?.[0]}>
        {({ id, describedBy }) => (
          <Input id={id} name="name" autoComplete="name" required aria-describedby={describedBy} />
        )}
      </Field>
      <Field label="Email address" required error={state.fieldErrors?.email?.[0]}>
        {({ id, describedBy }) => (
          <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} />
        )}
      </Field>
      <Field label="Topic" required error={state.fieldErrors?.topic?.[0]}>
        {({ id, describedBy }) => (
          <Select id={id} name="topic" required aria-describedby={describedBy} defaultValue="General">
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Message" required error={state.fieldErrors?.message?.[0]}>
        {({ id, describedBy }) => (
          <Textarea id={id} name="message" required maxLength={5000} aria-describedby={describedBy} />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
