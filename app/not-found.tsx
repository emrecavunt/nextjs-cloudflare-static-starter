import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-mono text-sm tracking-widest text-zinc-500 uppercase">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        This page does not exist.
      </h1>
      <p className="mt-4 text-zinc-600">
        A static site has real pages, not an app shell. If it isn&apos;t a file,
        it isn&apos;t a route.{' '}
        <Link href="/" className="underline">
          Back to the index
        </Link>
        .
      </p>
    </main>
  )
}
