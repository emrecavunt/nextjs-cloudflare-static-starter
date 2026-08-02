# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). Releases are cut by pushing a
`v*` tag (see `.github/workflows/release.yml`).

## [Unreleased]

### Fixed

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
