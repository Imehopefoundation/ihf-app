import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  // The auth gateway is not public content.
  robots: { index: false, follow: false },
};

/** Minimal gateway shell for sign-in / sign-up — no marketing or LMS chrome. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-full flex-col bg-cream">
        <header className="px-4 py-5">
          <Link href="/" aria-label="IME HOPE FOUNDATION — home">
            <Logo priority />
          </Link>
        </header>
        <main id="main" className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
