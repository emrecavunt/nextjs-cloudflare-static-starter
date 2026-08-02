// The one shared container: every route renders inside the same readable
// measure, so the layout never jumps between pages. `flex-1` pushes the
// footer to the bottom on short pages (see app/layout.tsx).
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:py-24">
      {children}
    </main>
  )
}
