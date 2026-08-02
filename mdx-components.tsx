import type { MDXComponents } from 'mdx/types'

// Map MDX elements to your own components here, e.g. wrap <img> in a figure
// with a caption, or add anchor links to headings. The defaults pass through.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}
