'use client'

import { useEffect, useRef, useState } from 'react'

// Every fenced code block renders through here (see mdx-components.tsx).
// Highlighting happens at build time via Shiki; this component only adds the
// copy button, which is the sole client JavaScript a code block ships.
export function Pre(props: React.ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    // Copy the code only: textContent skips the button label, and the line
    // numbers are CSS pseudo-elements, which never enter the clipboard.
    const text = preRef.current?.querySelector('code')?.textContent
    if (!text || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard blocked by permissions policy; leave the button unchanged.
    }
  }

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <pre ref={preRef} {...props}>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy code"
        className="absolute top-3 right-3 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] tracking-widest text-zinc-400 uppercase transition-colors hover:text-zinc-100"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {props.children}
    </pre>
  )
}
