import NextImage from 'next/image'

// JSX images in MDX: explicit dimensions (a static export has no optimizer
// to infer them), an optional caption, and a centred container.
//
//   <Image src="/images/diagram.svg" alt="..." width={800} height={400}
//          caption="Figure 1: the whole architecture" />
export function Image({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}) {
  return (
    <figure className="my-8">
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="mx-auto rounded-lg border border-zinc-100"
      />
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-xs text-zinc-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

// Markdown-style `![alt](src)` images carry no dimensions, so they stay a
// native <img>; next/image would need width/height the author never typed.
export function MarkdownImage(props: React.ComponentPropsWithoutRef<'img'>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see note above
    <img
      loading="lazy"
      {...props}
      alt={props.alt ?? ''}
      className="mx-auto my-8 rounded-lg"
    />
  )
}
