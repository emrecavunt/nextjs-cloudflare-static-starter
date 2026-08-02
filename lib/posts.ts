import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import readingTime from 'reading-time'

import type { Frontmatter, PostMeta } from './types'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export function getPostSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

export async function getPost(slug: string) {
  try {
    const post = (await import(`../content/posts/${slug}.mdx`)) as {
      default: React.ComponentType
      frontmatter: Frontmatter
    }
    // Reading time comes from the raw source, not the rendered HTML: code
    // blocks and JSX components count as prose, frontmatter does not parse.
    const raw = readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), 'utf8')
    const readingTimeMinutes = Math.max(1, Math.ceil(readingTime(raw).minutes))
    return { ...post, readingTimeMinutes }
  } catch {
    return null
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(
    getPostSlugs().map(async (slug) => {
      const post = await getPost(slug)
      // The slug came from readdir, so a null here means the .mdx itself is
      // broken — fail the build loudly rather than render a half-empty index.
      if (!post) throw new Error(`Failed to load post: ${slug}`)
      return {
        slug,
        ...post.frontmatter,
        readingTimeMinutes: post.readingTimeMinutes,
      }
    }),
  )
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
}
