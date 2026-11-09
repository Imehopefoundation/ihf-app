import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  // CLAUDE.md: tab title is "IHF".
  title: {
    default: "IHF",
    template: "%s · IHF",
  },
  description:
    "IME HOPE FOUNDATION — raising empowered individuals who in turn raise others, across Africa.",
  applicationName: "IHF",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading a request header opts every route into per-request (dynamic)
  // rendering, which is what lets Next.js apply the per-request CSP nonce (set
  // in src/proxy.ts) to the <script> tags it generates. Without this, a
  // statically prerendered page would ship no-nonce scripts that the strict CSP
  // then blocks. Trade-off (static caching) is tracked in docs/OPEN_ITEMS.md.
  await headers();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
