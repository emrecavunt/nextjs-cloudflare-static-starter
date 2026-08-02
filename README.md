# nextjs-cloudflare-static-starter

[![CI](https://github.com/emrecavunt/nextjs-cloudflare-static-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/emrecavunt/nextjs-cloudflare-static-starter/actions/workflows/ci.yml)
[![CodeQL](https://github.com/emrecavunt/nextjs-cloudflare-static-starter/actions/workflows/codeql.yml/badge.svg)](https://github.com/emrecavunt/nextjs-cloudflare-static-starter/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/emrecavunt/nextjs-cloudflare-static-starter?include_prereleases&sort=semver)](https://github.com/emrecavunt/nextjs-cloudflare-static-starter/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-24-brightgreen)](.nvmrc)

A Next.js static export on Cloudflare Pages: fast, free, and no server to
patch. This repo is the runnable companion to
[Serving a Next.js Static Site on Cloudflare](https://emrecavunt.com/blog/serving-nextjs-static-on-cloudflare).
Clone it and `pnpm build`; you get `output: 'export'`, MDX content, security
headers, keyless CI deploys, and Terraform for the platform.

The catch: a static export has **no SSR, no ISR, no API routes, no middleware,
and no runtime image optimisation**. For content that changes when _you_
change it (a blog, a docs site, a marketing page), that list is the point. If
you need per-request compute, pick a runtime (OpenNext on Workers, say) and
pay for it knowingly.

## What's in the box

- **Next.js 16** (App Router), React 19, TypeScript. `output: 'export'`,
  `trailingSlash: true`, `images.unoptimized`
- **MDX via the official `@next/mdx`**. No Contentlayer, no CMS; the content
  model is `ls content/posts`. Frontmatter is re-exported per module by
  `remark-mdx-frontmatter`, typed via `mdx.d.ts`
- **MDX components in the box**: Shiki code blocks (build-time highlighting,
  line numbers, copy button), `Callout`/`Warning`/`Insight`, `TLDR`,
  captioned `Image` — see [MDX components](#mdx-components) below
- **Post chrome**: reading time computed at build time, formatted dates, and
  a reading-progress bar on post pages
- **Tailwind CSS v4** with the typography plugin, Prettier with class sorting,
  ESLint 9 flat config. All wired
- **Security headers and redirects as files**: `public/_headers` and
  `public/_redirects`, shipped verbatim into `out/` on every build
- **SEO plumbing**: `sitemap.ts`, `robots.ts`, per-post `generateMetadata`,
  SVG favicon, `metadataBase` from `NEXT_PUBLIC_SITE_URL`
- **A Makefile front-end**: `make` lists everything, `make check` is what CI
  runs, `make deploy` ships from your laptop
- **CI**: `ci.yml` (lint, typecheck, build, Playwright e2e) plus four deploy
  workflows. One simple, three keyless (GCP, AWS, Vault); keep one, delete
  the rest
- **Tests**: Playwright `e2e` against the built `out/` (what Cloudflare would
  serve) and `smoke` against your deployed URL (headers, caching, real 404s)
- **Scans**: CodeQL on every PR and weekly, dependency review on PRs
- **Releases**: push a `v*` tag and `release.yml` cuts a GitHub Release with
  generated notes. `CHANGELOG.md` follows Keep a Changelog
- **Terraform**: `terraform/cloudflare` for the site, `terraform/gcp` or
  `terraform/aws` for the keyless identity layer
- **Dependabot** for npm and GitHub Actions

## Quickstart

Requires Node 24 (`.nvmrc` pins it) and pnpm 10.

```bash
git clone https://github.com/emrecavunt/nextjs-cloudflare-static-starter.git my-site
cd my-site
make install
make dev          # http://localhost:3000
```

`make` (or `make help`) lists every target. The ones you'll reach for:

| Target                            | What it does                                        |
| --------------------------------- | --------------------------------------------------- |
| `make dev`                        | Dev server with hot reload                          |
| `make build`                      | Static export → `out/`                              |
| `make check`                      | Lint + typecheck + build + e2e (what CI runs)       |
| `make test`                       | Build, then Playwright e2e against `out/`           |
| `make preview`                    | Build and serve `out/` locally, production-accurate |
| `make deploy`                     | Build and `wrangler pages deploy out`               |
| `make tf-plan BACKEND=cloudflare` | Terraform, per root (`gcp`, `aws` too)              |

## Adding a post

Create `content/posts/my-post.mdx`:

```mdx
---
title: 'My post'
date: '2026-08-02'
summary: 'One sentence for the index, the sitemap, and the meta description.'
tags: ['Cloudflare']
---

Words go here. GFM tables, task lists, and fenced code blocks all work.
```

On the next build, `out/blog/my-post/index.html` exists and the home page
lists it, sorted by `date`, no code changes. Delete the file and the page
stops existing. `git log` is the CMS audit trail.

## MDX components

Every post can use these without imports; they're registered once in
`mdx-components.tsx` and live in `components/mdx/`. The showcase post at
`/blog/mdx-components/` is the living demo (and the e2e fixture).

**Code blocks** are highlighted by Shiki at build time
(`rehype-pretty-code`, theme `github-dark-default`) — zero highlighting JS
ships to the reader. The copy button, language tag, and line numbers are
added by `components/mdx/pre.tsx` and `app/globals.css`:

    ```ts
    export function greet(name: string): string {
      return `Hello, ${name}!`
    }
    ```

**Callouts** come in three kinds; unknown types fall back to `note`:

```mdx
<Callout type="note">Context that helps but isn't load-bearing.</Callout>
<Warning>Things that silently break a static export.</Warning>
<Insight>The one sentence a reader should keep.</Insight>
```

**TLDR** is the executive-summary box that opens a long post:

```mdx
<TLDR>The whole post in two sentences, for the skimmers.</TLDR>
```

**Image** wraps `next/image` in a figure with an optional caption. A static
export has no optimizer to infer dimensions, so pass them explicitly:

```mdx
<Image
  src="/images/diagram.svg"
  alt="..."
  width={800}
  height={400}
  caption="The whole architecture, in one figure."
/>
```

Headings get anchor `id`s via `rehype-slug`. Delete any component you don't
need — each is self-contained and `mdx-components.tsx` is the only registry.

## The two files that matter

A static export has no server, so `next.config.js` headers do nothing: there
is no Next server to send them. Cloudflare Pages reads
[`_headers`](https://developers.cloudflare.com/pages/configuration/headers/)
and [`_redirects`](https://developers.cloudflare.com/pages/configuration/redirects/)
from your published output. Both live in `public/` and ship verbatim:

- **`public/_headers`**: CSP, HSTS, `nosniff`, frame denial, referrer and
  permissions policies for `/*`, plus immutable caching for `/_next/static/*`
- **`public/_redirects`**: old slug → new home, one per line, reviewed in PRs
  like everything else

## Testing: before and after you deploy

Two Playwright projects, one for each side of the deploy.

The `e2e` project asks "will the export work?" It runs against the built
`out/` served locally, exactly the files Cloudflare would get. Routes render
with one `<h1>`, every post is linked from the home page and present in
`sitemap.xml`, metadata exists, the custom `404.html` is served, and
`_headers`/`_redirects` actually landed in `out/`. This is the pre-push gate;
CI runs it on every PR:

```bash
make test          # = pnpm build && pnpm test:e2e
```

The `smoke` project asks "did the platform apply what only it can?"
Request-only checks against your deployed URL: the security headers from
`_headers` (a local server never sends those), immutable caching on
`/_next/static/*`, live sitemap and robots, real 404 statuses. Run it after
your first deploy and after any `_headers` change:

```bash
make test-smoke SMOKE_BASE_URL=https://your.site
```

Both suites read `content/posts/` for their fixtures, so they keep passing as
you add or delete posts. No fixture drift.

## Deploying: pick your path

Terraform owns the platform; Wrangler ships the bits. `terraform/cloudflare`
creates the Pages project, custom domain, and DNS (see
[terraform/README.md](terraform/README.md)); every deploy path below uploads
`out/` to it with `wrangler pages deploy`.

**From your laptop** (good enough while it's just you):

```bash
export CLOUDFLARE_API_TOKEN="..."   # Pages › Edit
export CLOUDFLARE_ACCOUNT_ID="..."
make deploy
```

**From CI**: four workflows ship in `.github/workflows/`. Keep one, delete
the other three, and don't leave four deploy triggers racing each other:

| Workflow                   | Where the Cloudflare token lives                                            | Credentials stored in GitHub | Setup                                  |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------- | -------------------------------------- |
| `deploy.yml`               | GitHub Actions secret                                                       | A long-lived API token       | Two repo secrets                       |
| `deploy-keyless-gcp.yml`   | GCP Secret Manager, fetched at deploy time via Workload Identity Federation | None                         | `terraform/gcp`                        |
| `deploy-keyless-aws.yml`   | AWS Secrets Manager, fetched at deploy time via GitHub OIDC → IAM role      | None                         | `terraform/aws`                        |
| `deploy-keyless-vault.yml` | HashiCorp Vault, fetched at deploy time via JWT auth on the OIDC token      | None                         | One-time Vault JWT role (in-file docs) |

The simple path is fine; a personal blog is not a bank. The keyless paths
exist because a long-lived token sitting in your CI provider is exactly the
kind of credential that leaks, and because all three are the same shape:
GitHub mints an OIDC token, your cloud exchanges it for short-lived
credentials scoped to this one repository, and the workflow reads the real
secret at deploy time. Pick whichever cloud you already pay for.

All four workflows deploy pushes to `main` into a protected `production`
environment and PRs into an open `preview` one, skip fork PRs (no OIDC
access), and write a deployment summary to the run page. The Terraform roots
create those environments and fill them with non-secret variables only.

## Foot-guns, enumerated

- **Images.** `images: { unoptimized: true }` is mandatory: forget it and the
  build fails the moment you use `next/image`. Pre-size your images instead.
- **Dynamic routes need `generateStaticParams`.** Nothing renders
  `/blog/[slug]` on demand; `dynamicParams = false` keeps unknown paths
  404ing like a static site should.
- **No API routes, middleware, or server actions.** They need the runtime you
  deleted. A contact form means an external endpoint or a different shape.
- **Trailing slashes.** Cloudflare serves `/blog/post/` from
  `blog/post/index.html`; `trailingSlash: true` keeps dev and prod agreeing.
- **404s.** Next emits a static `404.html` (customise `app/not-found.tsx`);
  Pages serves it automatically. Don't reach for SPA-style catch-alls.

## Layout

```
app/                    # routes: home, /blog/[slug], 404, sitemap, robots, icon
components/             # site chrome (header/footer/shell) + mdx/ (Pre, Callout, …)
content/posts/          # the CMS: one .mdx per post
lib/                    # getPostSlugs/getAllPosts, reading time, date formatting
public/_headers         # security headers, shipped verbatim into out/
public/_redirects       # redirects, same deal
tests/e2e/              # Playwright vs the local static export (pre-push gate)
tests/smoke/            # Playwright vs the deployed URL (headers, caching, 404s)
.github/workflows/      # ci.yml, codeql.yml, dependency-review.yml, release.yml
                        # + four deploy paths (keep one)
terraform/              # cloudflare (the site) + gcp | aws (the keyless layer)
Makefile                # the front-end to all of it: run `make`
```

## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Configuring OpenID Connect in AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [google-github-actions/auth (Workload Identity Federation)](https://github.com/google-github-actions/auth)
- [hashicorp/vault-action (JWT auth with GitHub OIDC)](https://github.com/hashicorp/vault-action)
- [The companion blog post](https://emrecavunt.com/blog/serving-nextjs-static-on-cloudflare)
