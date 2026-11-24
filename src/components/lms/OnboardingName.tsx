"use client";

import { useActionState } from "react";
import { completeOnboardingAction, type OnboardState } from "@/app/(lms)/app/onboarding-action";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: OnboardState = { status: "idle" };

export function OnboardingName() {
  const [state, action, pending] = useActionState(completeOnboardingAction, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      <Field label="Your name" required>
        {({ id }) => (
          <Input id={id} name="name" autoComplete="name" autoFocus required placeholder="e.g. Grace Adeyemi" />
        )}
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : "Continue"}
      </Button>
    </form>
  );
}
