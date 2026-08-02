import { readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The content model is `ls content/posts`, so the tests read the same
 * directory. Add or delete a post and the suite adjusts; no fixture drift.
 */
export function getPostSlugs(): string[] {
  return readdirSync(join(process.cwd(), 'content', 'posts'))
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

export function getPostRoutes(): string[] {
  return getPostSlugs().map((slug) => `/blog/${slug}/`)
}
