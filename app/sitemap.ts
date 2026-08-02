import type { MetadataRoute } from 'next'

import { getAllPosts } from '@/lib/posts'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

// Metadata routes are dynamic by default; a static export must render them
// at build time.
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}/`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
