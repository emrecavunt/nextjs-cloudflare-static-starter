import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPost, getPostSlugs } from '@/lib/posts'

// A static export has nothing to render unknown slugs on demand. Enumerate
// the params at build time and refuse everything else.
export const dynamicParams = false

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const { default: Post, frontmatter } = post

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="font-mono text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← All posts
      </Link>
      <article className="prose prose-zinc mt-8 max-w-none">
        <p className="not-prose font-mono text-xs text-zinc-400">
          {frontmatter.date} · {frontmatter.tags.join(', ')}
        </p>
        <h1 className="mt-2">{frontmatter.title}</h1>
        <Post />
      </article>
    </main>
  )
}
