import Link from 'next/link'

import { getAllPosts } from '@/lib/posts'

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="font-mono text-sm tracking-widest text-zinc-500 uppercase">
        nextjs-cloudflare-static-starter
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Static. On the edge. Boring on purpose.
      </h1>
      <p className="mt-4 leading-7 text-zinc-600">
        A Next.js static export served from Cloudflare Pages. No server, no
        runtime bill, nothing to patch at 3am. Posts are MDX files in{' '}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm">
          content/posts
        </code>
        ; the platform is Terraform; deploys are keyless.
      </p>

      <ul className="mt-14 space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}/`} className="group block">
              <span className="font-mono text-xs text-zinc-400">
                {post.date}
              </span>
              <h2 className="mt-1 text-xl font-medium group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {post.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
