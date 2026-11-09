import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
  themeColor: "#f6f2e9",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading a request header opts every route into per-request (dynamic)
  // rendering, which is what lets Next.js apply the per-request CSP nonce (set
  // in src/proxy.ts) to the <script> tags it generates. Without this, a
  // statically prerendered page would ship no-nonce scripts that the strict CSP
  // then blocks. Trade-off (static caching) is tracked in docs/OPEN_ITEMS.md.
  await headers();

  return (
    <html lang="en" className={`${sora.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
