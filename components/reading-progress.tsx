'use client'

import { useEffect, useState } from 'react'

// Thin bar pinned to the top of the viewport that fills as the reader scrolls
// the article. Rendered on post pages; the only client JS in the page chrome.
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const article =
      document.querySelector<HTMLElement>('article') ?? document.documentElement

    const onScroll = () => {
      const rect = article.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)))
      setProgress(done)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-zinc-100"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <span
        className="block h-full origin-left bg-zinc-900"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
