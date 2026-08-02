import createMDX from '@next/mdx'

// Wire MDX once, with frontmatter support. remark-frontmatter parses the YAML
// block; remark-mdx-frontmatter re-exports it as a plain `frontmatter` object
// on each module. No third-party MDX renderer, no separate frontmatter parser.
// Order matters: frontmatter must be parsed before it can be exported.
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      ['remark-mdx-frontmatter', { name: 'frontmatter' }],
      'remark-gfm',
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a fully static site into ./out; no Node server at runtime.
  output: 'export',

  // Cloudflare serves files as-is; there is no Next.js image optimizer on the
  // edge, so opt every <Image> into the unoptimized path.
  images: { unoptimized: true },

  // Export every route as a directory with its own index.html. This keeps
  // Cloudflare's static routing and the dev server agreeing on trailing slashes.
  trailingSlash: true,

  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default withMDX(nextConfig)
