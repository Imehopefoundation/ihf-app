/** Placeholder for an LMS section that is scaffolded but not yet built out. */
export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">{blurb}</p>
      <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-cream-200 bg-cream/40 p-10 text-center">
        <p className="text-sm font-medium text-ink">This area is being built.</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
          The structure and access controls are in place. The features for this
          section are coming in an upcoming phase.
        </p>
      </div>
    </div>
  );
}
