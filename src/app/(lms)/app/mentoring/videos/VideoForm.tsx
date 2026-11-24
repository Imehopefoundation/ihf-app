"use client";

import { useActionState } from "react";
import { postVideoAction, type VideoFormState } from "./actions";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: VideoFormState = { status: "idle" };

export function VideoForm() {
  const [state, action, pending] = useActionState(postVideoAction, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Video posted. Your mentees can now watch it.
        </p>
      )}
      <Field label="Title" required>
        {({ id }) => <Input id={id} name="title" required maxLength={160} />}
      </Field>
      <Field label="YouTube or Vimeo link" required hint="Paste the share link — mentees watch it embedded; the link itself is validated.">
        {({ id, describedBy }) => (
          <Input id={id} name="url" type="url" inputMode="url" required aria-describedby={describedBy} placeholder="https://youtu.be/…" />
        )}
      </Field>
      <Field label="Description (optional)">
        {({ id }) => <Textarea id={id} name="description" maxLength={2000} />}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post video"}
      </Button>
    </form>
  );
}
