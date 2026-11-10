"use client";

import { useActionState } from "react";
import { registerGuardian, addChildAction, type FlowState } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: FlowState = { status: "idle" };

function ErrorBanner({ state }: { state: FlowState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
      {state.message}
    </p>
  );
}

export function GuardianForm() {
  const [state, action, pending] = useActionState(registerGuardian, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <ErrorBanner state={state} />
      <Field label="Your full name" required error={state.fieldErrors?.fullName?.[0]}>
        {({ id, describedBy }) => (
          <Input id={id} name="fullName" autoComplete="name" required aria-describedby={describedBy} />
        )}
      </Field>
      <Field label="Phone (optional)" hint="Kept private; used only by IHF staff to reach you.">
        {({ id, describedBy }) => (
          <Input id={id} name="phone" type="tel" autoComplete="tel" aria-describedby={describedBy} />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Register as guardian"}
      </Button>
    </form>
  );
}

export function AddChildForm() {
  const [state, action, pending] = useActionState(addChildAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <ErrorBanner state={state} />
      <Field label="Child's full name" required error={state.fieldErrors?.fullName?.[0]}>
        {({ id, describedBy }) => <Input id={id} name="fullName" required aria-describedby={describedBy} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" required error={state.fieldErrors?.dob?.[0]}>
          {({ id, describedBy }) => <Input id={id} name="dob" type="date" required aria-describedby={describedBy} />}
        </Field>
        <Field label="Age group" required error={state.fieldErrors?.ageGroup?.[0]}>
          {({ id, describedBy }) => (
            <Select id={id} name="ageGroup" required aria-describedby={describedBy} defaultValue="6-11">
              <option value="6-11">6–11</option>
              <option value="12-16">12–16</option>
            </Select>
          )}
        </Field>
      </div>
      <Field label="School (optional)" error={state.fieldErrors?.school?.[0]}>
        {({ id, describedBy }) => <Input id={id} name="school" aria-describedby={describedBy} />}
      </Field>
      <Field label="Anything we should know (optional)" hint="Encrypted and visible only to authorised staff.">
        {({ id, describedBy }) => <Textarea id={id} name="notes" aria-describedby={describedBy} />}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add child"}
      </Button>
    </form>
  );
}
