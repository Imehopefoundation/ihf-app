import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfileName } from "@/lib/data/profile";
import { LmsShell } from "@/components/lms/LmsShell";
import { OnboardingName } from "@/components/lms/OnboardingName";
import { Logo } from "@/components/ui/Logo";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: { default: "LMS", template: "%s · IHF LMS" },
  // The LMS is private; never index it.
  robots: { index: false, follow: false },
};

/**
 * LMS shell + auth gate. Unauthenticated requests are redirected to the sign-in
 * gateway (defence in depth: the proxy also gates /app, and RLS guards all data).
 * First-run: if the member has no name yet, we ask for it before anything else
 * and use it to welcome them everywhere.
 */
export default async function LmsLayout({ children }: { children: ReactNode }) {
  const { user, roles } = await requireSessionUser("/app");
  const supabase = await createClient();
  const name = await getProfileName(supabase, user.id);

  if (!name) {
    return (
      <ToastProvider>
        <div className="flex min-h-full flex-1 items-center justify-center bg-cream px-4 py-12">
          <div className="w-full max-w-md">
            <div className="mb-6 flex justify-center">
              <Logo priority />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Welcome to IHF
              </p>
              <h1 className="mt-2 text-center text-2xl font-semibold text-ink">What&apos;s your name?</h1>
              <p className="mt-2 mb-6 text-center text-sm text-ink-soft">
                We&apos;ll use it to welcome you throughout your journey.
              </p>
              <OnboardingName />
            </div>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <LmsShell email={user.email ?? ""} roles={roles}>
        {children}
      </LmsShell>
    </ToastProvider>
  );
}
