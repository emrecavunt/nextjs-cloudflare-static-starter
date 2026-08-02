import type { MDXComponents } from 'mdx/types'

import { Callout, Insight, Warning } from '@/components/mdx/callout'
import { Image, MarkdownImage } from '@/components/mdx/image'
import { Pre } from '@/components/mdx/pre'
import { TLDR } from '@/components/mdx/tldr'

// What every MDX post can use, wired once:
//  - element overrides: fenced code renders through Pre (copy button),
//    markdown images through MarkdownImage
//  - JSX components available in .mdx files with no import:
//    <Callout>, <Warning>, <Insight>, <TLDR>, <Image>
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: Pre,
    img: MarkdownImage,
    Callout,
    Warning,
    Insight,
    TLDR,
    Image,
    ...components,
  }
}
