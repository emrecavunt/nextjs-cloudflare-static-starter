# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). Releases are cut by pushing a
`v*` tag (see `.github/workflows/release.yml`).

## [Unreleased]

### Changed

- Deploy workflows now ship inert (`workflow_dispatch` only) so the template
  and fresh clones never fire failing deploys against an unconfigured
  Cloudflare account; uncomment the `push`/`pull_request` triggers in the one
  workflow you keep to activate real deploys

### Added

- MDX component set (`components/mdx/`), wired once in `mdx-components.tsx`
  and usable in every post without imports: code blocks with build-time Shiki
  highlighting (`rehype-pretty-code`), line numbers, and a copy button;
  `Callout`/`Warning`/`Insight`; `TLDR`; captioned `Image`. Heading anchors
  via `rehype-slug`
- Shared chrome: `SiteHeader`/`SiteFooter` in the root layout and a
  `PageShell` container shared by every route
- Post chrome: reading time computed from the raw `.mdx` at build time,
  formatted dates (`lib/format.ts`), and a reading-progress bar on post pages
- Showcase post `content/posts/mdx-components.mdx` doubling as living docs,
  pinned by `tests/e2e/mdx-components.spec.ts`

### Fixed

- Keyless deploy workflow names are now quoted YAML strings, so GitHub shows
  `Deploy (keyless: …)` instead of the file path — and Prettier can parse the
  files again
- Build no longer crashes with `TypeError: Invalid URL` when
  `NEXT_PUBLIC_SITE_URL` is set but empty (the deploy workflows pass the
  GitHub variable through, and an unconfigured variable arrives as `""`)

### Security

- Bump `next`, `@next/mdx`, and `eslint-config-next` to 16.2.12 (9 Next.js
  advisories); override transitive `postcss` to ^8.5.25 and `sharp` to
  ^0.35.3 (4 advisories). `pnpm audit` is clean

## [0.1.0] - 2026-08-02

### Added

- Next.js 16 (App Router) static export starter for Cloudflare Pages: MDX
  content via `@next/mdx`, Tailwind CSS v4, TypeScript
- Security headers (`public/_headers`) and redirects (`public/_redirects`)
  shipped verbatim into `out/`
- SEO plumbing: `sitemap.ts`, `robots.ts`, per-post metadata
- CI (lint, typecheck, build, Playwright e2e) plus four deploy workflows:
  simple token and keyless via GCP, AWS, or Vault
- CodeQL and dependency-review scans
- Playwright test suites: `e2e` against the local static export, `smoke`
  against a deployed URL
- Terraform for the Cloudflare site and the keyless identity layer
- Makefile front-end, Dependabot, MIT license

[Unreleased]: https://github.com/emrecavunt/nextjs-cloudflare-static-starter/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/emrecavunt/nextjs-cloudflare-static-starter/releases/tag/v0.1.0
