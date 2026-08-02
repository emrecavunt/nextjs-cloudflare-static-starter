import type { ReactNode } from 'react'

// The authoring vocabulary maps to three visual kinds, the same idea as
// admonitions in docs frameworks. Unknown types fall back to `note`, so a
// typo in a post never breaks the build.
const KIND = {
  note: {
    label: 'Note',
    classes: 'border-zinc-300 bg-zinc-50 text-zinc-800',
  },
  warning: {
    label: 'Warning',
    classes: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  insight: {
    label: 'Insight',
    classes: 'border-sky-300 bg-sky-50 text-sky-900',
  },
} as const

type CalloutKind = keyof typeof KIND

export function Callout({
  type = 'note',
  label,
  children,
}: {
  type?: CalloutKind | (string & {})
  label?: string
  children: ReactNode
}) {
  const kind = KIND[type as CalloutKind] ?? KIND.note
  return (
    <aside
      className={`not-prose my-6 rounded-lg border-l-4 px-5 py-4 ${kind.classes}`}
    >
      <p className="font-mono text-xs font-medium tracking-widest uppercase opacity-70">
        {label ?? kind.label}
      </p>
      <div className="mt-1 text-sm leading-6 [&_a]:underline [&_code]:rounded [&_code]:bg-black/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8125em] [&>p+p]:mt-2">
        {children}
      </div>
    </aside>
  )
}

export function Warning({ children }: { children: ReactNode }) {
  return <Callout type="warning">{children}</Callout>
}

export function Insight({ children }: { children: ReactNode }) {
  return <Callout type="insight">{children}</Callout>
}
