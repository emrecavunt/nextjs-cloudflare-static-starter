import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'

import { getPostSlugs } from '../helpers/site'

/**
 * The contract between this repo and Cloudflare Pages is the contents of
 * `out/`. These tests pin the pieces a browser test can't see.
 */
test.describe('static export contract', () => {
  const out = join(process.cwd(), 'out')

  test('_headers and _redirects shipped verbatim into out/', () => {
    expect(existsSync(join(out, '_headers')), 'out/_headers').toBe(true)
    expect(existsSync(join(out, '_redirects')), 'out/_redirects').toBe(true)
  })

  test('404.html exists for Pages to serve on unknown routes', () => {
    expect(existsSync(join(out, '404.html'))).toBe(true)
  })

  test('every post rendered to blog/<slug>/index.html', () => {
    for (const slug of getPostSlugs()) {
      const file = join(out, 'blog', slug, 'index.html')
      expect(existsSync(file), file).toBe(true)
    }
  })
})
