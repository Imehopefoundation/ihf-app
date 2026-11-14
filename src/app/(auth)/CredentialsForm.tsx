"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: AuthState = { status: "idle" };

/**
 * Sign-in, and invitation-only sign-up. In "signup" mode the form carries the
 * signed invite `token` and shows the invited email read-only — the account
 * email comes from the token server-side, never from this field.
 */
export function CredentialsForm({
  mode,
  next,
  token,
  lockedEmail,
}: {
  mode: "signin" | "signup";
  next?: string;
  token?: string;
  lockedEmail?: string;
}) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);

  if (state.status === "check-email") {
    return (
      <div role="status" className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {mode === "signin" && next && <input type="hidden" name="next" value={next} />}
      {mode === "signup" && token && <input type="hidden" name="token" value={token} />}

      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}

      {mode === "signup" ? (
        <Field label="Email address" hint="Your account is created for this invited address.">
          {({ id, describedBy }) => (
            <Input id={id} value={lockedEmail ?? ""} readOnly aria-describedby={describedBy} />
          )}
        </Field>
      ) : (
        <Field label="Email address" required>
          {({ id }) => <Input id={id} name="email" type="email" autoComplete="email" required />}
        </Field>
      )}

      <Field label="Password" required hint={mode === "signup" ? "At least 8 characters." : undefined}>
        {({ id, describedBy }) => (
          <Input
            id={id}
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : mode === "signin" ? "Log in" : "Create account"}
      </Button>
    </form>
  );
}
