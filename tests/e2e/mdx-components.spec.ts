import { expect, test } from '@playwright/test'

// The showcase post doubles as the fixture: if the MDX pipeline regresses
// (rehype-pretty-code, mdx-components.tsx), this is where it shows.
const SHOWCASE = '/blog/mdx-components/'

test.describe('mdx components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SHOWCASE, { waitUntil: 'domcontentloaded' })
  })

  test('code blocks are highlighted at build time', async ({ page }) => {
    const pre = page.locator('pre[data-language="ts"]').first()
    await expect(pre).toBeVisible()
    // Shiki paints tokens with inline styles before the HTML ships.
    await expect(pre.locator('span[style]').first()).toBeAttached()
  })

  test('copy button copies the code, not the chrome', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const button = page.getByRole('button', { name: 'Copy code' }).first()
    await button.click()
    await expect(button).toHaveText('Copied')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('export function greet')
    // Line numbers are CSS pseudo-elements; they never enter the clipboard.
    expect(copied).not.toContain('Copy')
  })

  test('callouts render with their kinds', async ({ page }) => {
    await expect(
      page.locator('aside').filter({ hasText: "isn't load-bearing" }),
    ).toContainText('Note')
    await expect(
      page.locator('aside').filter({ hasText: 'foot-guns' }),
    ).toContainText('Warning')
    await expect(
      page.locator('aside').filter({ hasText: 'one sentence a reader' }),
    ).toContainText('Insight')
  })

  test('the TLDR box renders', async ({ page }) => {
    await expect(page.locator('article aside').first()).toContainText('TL;DR')
  })

  test('headings carry anchor ids', async ({ page }) => {
    await expect(page.locator('h2#code-blocks')).toBeVisible()
  })

  test('JSX images render with a caption', async ({ page }) => {
    const figure = page.locator('figure').filter({
      hasText: 'The whole architecture, in one figure.',
    })
    await expect(figure.locator('img')).toBeVisible()
  })

  test('post pages ship a reading progress bar', async ({ page }) => {
    await expect(page.getByRole('progressbar')).toBeAttached()
  })
})
