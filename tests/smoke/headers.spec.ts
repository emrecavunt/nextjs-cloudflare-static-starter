import { expect, test } from '@playwright/test'

import { requireBaseUrl } from '../helpers/smoke'

test.beforeAll(() => requireBaseUrl())

/**
 * `public/_headers` only takes effect on Cloudflare; a local server never
 * sends these. This is the check that your security headers actually shipped.
 */
test('home response carries the security headers', async ({ request }) => {
  const res = await request.get('/')
  const h = res.headers()

  expect(h['content-security-policy'], 'CSP').toContain("default-src 'self'")
  expect(h['strict-transport-security'], 'HSTS').toContain('max-age=')
  expect(h['x-frame-options']).toBe('DENY')
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(h['permissions-policy']).toContain('camera=()')
})

test('static assets are cached as immutable', async ({ page, request }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const asset = await page
    .locator('script[src^="/_next/static/"]')
    .first()
    .getAttribute('src')
  test.skip(!asset, 'no /_next/static/ script found on the home page')

  const res = await request.get(asset!)
  expect(res.status()).toBe(200)
  expect(res.headers()['cache-control']).toContain('immutable')
})
