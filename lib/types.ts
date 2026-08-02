export interface Frontmatter {
  title: string
  /** ISO 8601 date, e.g. '2026-08-02'. */
  date: string
  summary: string
  tags: string[]
}

export interface PostMeta extends Frontmatter {
  slug: string
  /** Whole minutes, computed from the raw .mdx at build time. */
  readingTimeMinutes: number
}
