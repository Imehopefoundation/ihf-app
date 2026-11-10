import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { EmptyState } from "@/components/ui/Table";

export const metadata: Metadata = {
  title: "Our Impact",
  description: "Verified, aggregated results — published only once approved by IHF leadership.",
};

export default function ImpactPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Our impact</Eyebrow>
        <SectionTitle>Fruit we can account for.</SectionTitle>
        <Lead>
          Every figure on this page is drawn from our records and approved by
          leadership before it is published. Results achieved are shown
          separately from goals, and no individual&apos;s record is ever displayed.
        </Lead>
      </Section>

      <Section tone="white">
        <EmptyState title="Verified figures are on their way.">
          We only publish impact numbers once they have been checked and approved
          by our leadership. This space will show real, aggregated results —
          never estimates or targets presented as achievements.
        </EmptyState>
      </Section>
    </>
  );
}
