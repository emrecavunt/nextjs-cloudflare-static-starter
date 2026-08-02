declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types'
  import type { JSX } from 'react'

  import type { Frontmatter } from '@/lib/types'

  // Re-exported by remark-mdx-frontmatter (see next.config.mjs).
  export const frontmatter: Frontmatter

  const MDXContent: (props: MDXProps) => JSX.Element
  export default MDXContent
}
