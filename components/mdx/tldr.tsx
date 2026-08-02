import type { ReactNode } from 'react'

// The executive-summary box that opens a long post: the reader decides in
// ten seconds whether the next ten minutes are worth it.
export function TLDR({ children }: { children: ReactNode }) {
  return (
    <aside className="not-prose my-8 rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
      <p className="font-mono text-xs font-medium tracking-widest text-zinc-500 uppercase">
        TL;DR
      </p>
      <div className="mt-1 text-sm leading-6 text-zinc-700 [&_a]:underline [&_code]:rounded [&_code]:bg-black/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8125em] [&>p+p]:mt-2">
        {children}
      </div>
    </aside>
  )
}
