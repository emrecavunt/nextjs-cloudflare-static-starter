import { expect, test } from '@playwright/test'

import { getPostRoutes, getPostSlugs } from '../helpers/site'

test.describe('per-page metadata', () => {
  for (const route of ['/', ...getPostRoutes()]) {
    test(`title + meta description at ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/.+/)
      const description = page.locator('meta[name="description"]')
      await expect(description).toHaveAttribute('content', /.+/)
    })
  }
})

test.describe('crawl plumbing', () => {
  test('sitemap.xml lists the home page and every post', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const xml = await res.text()
    expect(xml).toContain('<urlset')
    for (const slug of getPostSlugs()) {
      expect(xml, `sitemap entry for ${slug}`).toContain(`/blog/${slug}/`)
    }
  })

  test('robots.txt allows crawling and points at the sitemap', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toMatch(/User-Agent: \*/i)
    expect(body).toMatch(/Allow: \//i)
    expect(body).toContain('sitemap.xml')
  })
})
