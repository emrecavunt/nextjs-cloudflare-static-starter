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
- `react` and `react-dom` are both 19.3.0. `next`, `@next/mdx`, and
  `eslint-config-next` move together
- GitHub Actions: `pnpm/action-setup` v6, `actions/setup-node` v7, and
  `cloudflare/wrangler-action` v4. pnpm is pinned to 10.34.5 via
  `packageManager` (the same pin the workflows install) so a floating pnpm
  10 cannot rewrite the lockfile out from under `pnpm.overrides`
- Dependabot groups the Next.js packages, the React packages, GitHub
  Actions, and other minor/patch updates, and raises the npm open-PR limit
  so security bumps are not stuck behind one-package PRs

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

- Bump `next`, `@next/mdx`, and `eslint-config-next` to 16.3.6, including
  [GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j)
  (ImageResponse RCE, Next.js 16.2.0–16.3.5). Override transitive `postcss`
  to ^8.5.28 and `sharp` to ^0.35.4
- Bump `remark-mdx-frontmatter` to 6.0.0, which drops the vulnerable `toml`
  dependency ([GHSA-82x6-q7mm-w9cf](https://github.com/advisories/GHSA-82x6-q7mm-w9cf),
  [GHSA-v5mp-jgw5-2x6j](https://github.com/advisories/GHSA-v5mp-jgw5-2x6j)).
  `pnpm audit` is clean

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
