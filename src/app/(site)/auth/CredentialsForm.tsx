"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: AuthState = { status: "idle" };

export function CredentialsForm({ mode }: { mode: "signin" | "signup" }) {
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
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      <Field label="Email address" required>
        {({ id }) => <Input id={id} name="email" type="email" autoComplete="email" required />}
      </Field>
      <Field
        label="Password"
        required
        hint={mode === "signup" ? "At least 8 characters." : undefined}
      >
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
      <p className="text-center text-sm text-ink-soft">
        {mode === "signin" ? (
          <>
            New to IHF?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-forest hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth" className="font-semibold text-forest hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
