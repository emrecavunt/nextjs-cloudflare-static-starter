import { expect, test } from '@playwright/test'

import { getPostRoutes } from '../helpers/site'

test.describe('routes render', () => {
  const ROUTES = ['/', ...getPostRoutes()]
  for (const route of ROUTES) {
    test(`200 + exactly one <h1> at ${route}`, async ({ page }) => {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(res?.status(), `status for ${route}`).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
    })
  }

  test('home page links every post', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    for (const route of getPostRoutes()) {
      await expect(page.locator(`a[href="${route}"]`).first()).toBeVisible()
    }
  })

  test('unknown route serves the custom 404 page', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-xyz/', {
      waitUntil: 'domcontentloaded',
    })
    expect(res?.status()).toBe(404)
    // Next's static 404.html is served (not the bare static-server default).
    await expect(page.locator('body')).toContainText(/404|not found/i)
  })
})
