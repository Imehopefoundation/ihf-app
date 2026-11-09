/**
 * Temporary holding page. The real public landing page (matching the Lovable
 * design, with the corrected copy from CLAUDE.md) is built in Phase 2.
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">IME HOPE FOUNDATION</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Raising empowered individuals who in turn raise others.
        </p>
        <p className="mt-6 text-xs text-zinc-500">Site in development.</p>
      </div>
    </main>
  );
}
