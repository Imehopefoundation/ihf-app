import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToastProvider } from "@/components/ui/Toast";

/** Public site shell: header + footer around the thin public layer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <ToastProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </ToastProvider>
  );
}
