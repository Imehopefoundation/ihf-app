"use client";

import { useActionState } from "react";
import { recordSessionAction, type SessionFormState } from "./actions";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: SessionFormState = { status: "idle" };

export function SessionForm() {
  const [state, action, pending] = useActionState(recordSessionAction, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Session recorded.
        </p>
      )}
      <Field label="Session title" required>
        {({ id }) => <Input id={id} name="title" required maxLength={160} placeholder="e.g. AI Masterclass — Week 3" />}
      </Field>
      <Field label="Date" required>
        {({ id }) => <Input id={id} name="date" type="date" required />}
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink-soft">What happened</legend>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" name="devotion" className="h-4 w-4 accent-[var(--color-forest)]" />
          Devotion was done
        </label>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" name="coc" className="h-4 w-4 accent-[var(--color-forest)]" />
          Code of Conduct was read
        </label>
      </fieldset>
      <Field label="Notes (optional)">
        {({ id }) => <Textarea id={id} name="notes" maxLength={2000} />}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Record session"}
      </Button>
    </form>
  );
}
