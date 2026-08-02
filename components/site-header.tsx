import Link from 'next/link'

// Site chrome lives in the root layout, not per page: one wordmark, one nav,
// zero h1s (each route owns exactly one h1, which the e2e suite pins).
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-mono text-xs font-medium tracking-widest text-zinc-900 uppercase"
        >
          nextjs-cloudflare-static-starter
        </Link>
        <nav className="font-mono text-xs tracking-wider uppercase">
          <a
            href="https://github.com/emrecavunt/nextjs-cloudflare-static-starter"
            className="text-zinc-500 hover:text-zinc-900"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
