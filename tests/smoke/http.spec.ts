import { expect, test } from '@playwright/test'

import { requireBaseUrl } from '../helpers/smoke'

test.beforeAll(() => requireBaseUrl())

test('home page responds 200 with HTML', async ({ request }) => {
  const res = await request.get('/')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/html')
})

test('sitemap.xml and robots.txt are live', async ({ request }) => {
  for (const path of ['/sitemap.xml', '/robots.txt']) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
  }
})

test('unknown routes return a real 404 status', async ({ request }) => {
  const res = await request.get('/this-route-does-not-exist-xyz/')
  expect(res.status()).toBe(404)
})
