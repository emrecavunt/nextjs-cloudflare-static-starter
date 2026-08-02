# AGENTS.md

Guidance for AI coding agents working in this repository. Read this before
making changes; it tells you how to build, test, and — just as importantly —
what this codebase deliberately does not do.

## Project overview

A Next.js 16 (App Router, React 19, TypeScript) blog starter deployed as a
**fully static export** to Cloudflare Pages. Content is MDX files in
`content/posts/`; there is no CMS, no database, and no server. Terraform owns
the platform, Wrangler ships the bits, and a Makefile fronts everything.

The defining constraint: `output: 'export'` in `next.config.mjs`. That means
**no SSR, no ISR, no API routes, no middleware, no server actions, and no
runtime image optimisation**. Do not add features that require a runtime —
they will either fail the build or silently not work. If a request seems to
need one, say so and propose a static alternative (build-time computation,
client-side fetch to an external endpoint, or a `_redirects` rule).

## Environment

- Node 24 (pinned in `.nvmrc`), pnpm 10. Use pnpm, never npm/yarn.
- One env var: `NEXT_PUBLIC_SITE_URL` (canonical URL for metadata, sitemap,
  robots). Falls back to `https://example.com` when unset or empty — CI never
  needs it. Copy `.env.example` to `.env.local` for local work.
- Deploys need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, but agents
  should not deploy unless explicitly asked.

## Commands

Prefer the Makefile targets; `make` lists them all.

| Task                                  | Command                                    |
| ------------------------------------- | ------------------------------------------ |
| Install                               | `make install`                             |
| Dev server                            | `make dev`                                 |
| Lint / typecheck                      | `make lint` / `make typecheck`             |
| Format (Prettier, all files)          | `make format`                              |
| Build static export → `out/`          | `make build`                               |
| E2E tests (builds first)              | `make test`                                |
| Smoke tests vs deployed URL           | `make test-smoke SMOKE_BASE_URL=https://…` |
| **Full pre-push gate (what CI runs)** | **`make check`**                           |

Run `make check` before considering any code change done. It runs lint +
typecheck + build + Playwright e2e, and it is exactly what CI runs on every
PR. A change that doesn't pass `make check` is not finished.

## Architecture invariants

These are load-bearing. Breaking them breaks the deploy model.

1. **Static export only.** `output: 'export'` stays. New dynamic routes must
   export `generateStaticParams`; keep `dynamicParams = false` so unknown
   paths 404 like a static site should.
2. **`images: { unoptimized: true }` stays.** There is no optimizer on the
   edge. Images must be pre-sized, and the MDX `Image` component requires
   explicit `width`/`height`.
3. **`trailingSlash: true` stays.** Cloudflare serves `/blog/post/` from
   `blog/post/index.html`; this keeps dev and prod agreeing.
4. **Headers and redirects are files, not config.** `next.config` headers do
   nothing without a server. Security headers live in `public/_headers`,
   redirects in `public/_redirects`, and both ship verbatim into `out/`.
   Change them there, and treat `_headers` changes as security-sensitive
   (CSP, HSTS live there).
5. **MDX is wired once.** Plugin config lives in `next.config.mjs` and plugin
   names must stay strings (Turbopack serialises the config — imports are not
   JSON-safe). Order matters: `remark-frontmatter` before
   `remark-mdx-frontmatter`.
6. **MDX components register in `mdx-components.tsx` only.** Components live
   in `components/mdx/`; that one file is the registry. Keep each component
   self-contained and usable in posts without imports.

## Content model

- One post = one `content/posts/<slug>.mdx`. Required frontmatter (typed in
  `lib/types.ts`, re-exported per module as `frontmatter`):
  `title`, `date` (ISO 8601), `summary`, `tags`.
- Adding a file adds the route, the index entry, and the sitemap entry on the
  next build — no code changes. Deleting the file removes all of them.
- Posts can use `<Callout type="note|warning|insight">`, `<Warning>`,
  `<Insight>`, `<TLDR>`, and captioned `<Image>` without imports.
  `content/posts/mdx-components.mdx` is the living showcase **and an e2e
  fixture** — `tests/e2e/mdx-components.spec.ts` pins it. Edit that post only
  together with its test.
- Reading time is computed at build time from the raw `.mdx` in
  `lib/posts.ts`.

## Code style

- TypeScript, strict; run `make typecheck`. Frontmatter types live in
  `lib/types.ts`, module declarations in `mdx.d.ts`.
- Prettier: no semicolons, single quotes, Tailwind class sorting via
  `prettier-plugin-tailwindcss`. Run `make format` rather than hand-formatting.
- ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript).
- Match the existing voice: plain function components, named exports, no
  barrel files, comments only for non-obvious intent (see `next.config.mjs`
  and `lib/posts.ts` for the house style).

## Testing

- **e2e** (`tests/e2e/`) runs against the built `out/` — the exact files
  Cloudflare would serve. It asserts routes render, every post is linked and
  in the sitemap, metadata exists, the custom `404.html` works, and
  `_headers`/`_redirects` landed in `out/`. This is the pre-push gate.
- **smoke** (`tests/smoke/`) runs request-only checks against a deployed URL
  (real security headers, immutable caching on `/_next/static/*`, live
  sitemap/robots, real 404 statuses). Only relevant after a deploy or a
  `_headers` change.
- Both suites read `content/posts/` for fixtures, so they adapt as posts are
  added or deleted. Do not hard-code post slugs in tests — except the
  `mdx-components` showcase, which is intentionally pinned.
- New behaviour needs a test in the appropriate suite; a route or content
  change that breaks the export contract should fail `tests/e2e/`, not ship.

## CI/CD

- `.github/workflows/ci.yml` = lint, typecheck, build, e2e. CodeQL and
  dependency-review scan PRs.
- The four deploy workflows (`deploy.yml`, `deploy-keyless-{gcp,aws,vault}.yml`)
  are **inert by default** (`workflow_dispatch` only) so fresh clones never
  fire failing deploys. Do not enable `push`/`pull_request` triggers unless
  the user explicitly asks — activating one is a deliberate, per-user choice,
  and the other three should be deleted when one is chosen.
- Releases: pushing a `v*` tag cuts a GitHub Release. `CHANGELOG.md` follows
  Keep a Changelog — add user-facing changes under `## [Unreleased]` in the
  appropriate section (`Added`/`Changed`/`Fixed`/`Security`).
- Terraform roots: `terraform/cloudflare` (the site), `terraform/gcp` and
  `terraform/aws` (the keyless identity layer). Use
  `make tf-plan BACKEND=cloudflare|gcp|aws`; never `apply` without being asked.

## Boundaries for agents

- **Never commit secrets.** `.env.local` is gitignored; keep it that way.
  Deploy credentials belong in GitHub secrets / cloud secret managers, not in
  files here.
- **Don't add a runtime.** No API routes, middleware, server actions, or
  server-rendered dynamic pages. If the request fundamentally needs one, stop
  and surface the trade-off instead of working around the constraint.
- **Don't weaken security posture.** `_headers`, CSP, and the CodeQL /
  dependency-review setup are features, not friction. Propose tightening, not
  loosening — and flag it clearly when a requested change would loosen.
- **Don't deploy or apply Terraform** unless explicitly instructed.
- **Keep dependencies minimal.** This starter's value is having few moving
  parts. Prefer platform features and build-time work over new packages, and
  justify any addition.
