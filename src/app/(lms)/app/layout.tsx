import type { Metadata } from "next";
import { requireSessionUser } from "@/lib/auth/session";
import { LmsShell } from "@/components/lms/LmsShell";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: { default: "LMS", template: "%s · IHF LMS" },
  // The LMS is private; never index it.
  robots: { index: false, follow: false },
};

/**
 * LMS shell + auth gate. Unauthenticated requests are redirected to the sign-in
 * gateway (defence in depth: the proxy also gates /app, and RLS guards all data).
 */
export default async function LmsLayout({ children }: { children: React.ReactNode }) {
  const { user, roles } = await requireSessionUser("/app");

  return (
    <ToastProvider>
      <LmsShell email={user.email ?? ""} roles={roles}>
        {children}
      </LmsShell>
    </ToastProvider>
  );
}
