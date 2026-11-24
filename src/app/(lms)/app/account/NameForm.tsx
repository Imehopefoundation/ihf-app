"use client";

import { useActionState } from "react";
import { saveNameAction, type NameState } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: NameState = { status: "idle" };

export function NameForm({ currentName }: { currentName: string | null }) {
  const [state, action, pending] = useActionState(saveNameAction, initial);

  return (
    <form action={action} className="space-y-3" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Saved.
        </p>
      )}
      <Field label="Your name" hint="Used to greet you; encrypted and visible only to you and IHF staff.">
        {({ id, describedBy }) => (
          <Input id={id} name="name" defaultValue={currentName ?? ""} autoComplete="name" required aria-describedby={describedBy} />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save name"}
      </Button>
    </form>
  );
}
