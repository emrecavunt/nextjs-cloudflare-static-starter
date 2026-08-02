// Pinned locale: CI, your laptop, and every reader's browser format the
// same string, so snapshots and sitemaps never drift by timezone.
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** '2026-08-02' → '2 Aug 2026' */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}

export function formatReadingTime(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min read`
}
