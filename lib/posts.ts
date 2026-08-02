import { readdirSync } from 'node:fs'
import path from 'node:path'

import type { Frontmatter, PostMeta } from './types'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export function getPostSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

export async function getPost(slug: string) {
  try {
    return (await import(`../content/posts/${slug}.mdx`)) as {
      default: React.ComponentType
      frontmatter: Frontmatter
    }
  } catch {
    return null
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(
    getPostSlugs().map(async (slug) => {
      const post = await getPost(slug)
      return { slug, ...(post?.frontmatter as Frontmatter) }
    }),
  )
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
}
